#!/bin/bash
# Copyright diskreport.net 2020

set -e

# force find date/time format
export LANG=C

if [ -z "$UPLOAD_SERVER" ]; then
    UPLOAD_SERVER=https://upload.diskreport.net
fi
if [ -z "$API_SERVER" ]; then
    API_SERVER=https://www.diskreport.net
fi

# Generate keys if missing
PUB=~/.diskreport.pub
PRIV=~/.diskreport.priv
test -f $PRIV || openssl genrsa -out $PRIV
test -f $PUB || openssl rsa -in $PRIV -pubout -out $PUB
PUB64=$(cat $PUB | openssl base64 -A)

function sign_api_request() {
    URL="$1"
    NAME="$2"
    VALUE="$3"
    SIGNATURE=$(echo -n "$VALUE" | openssl dgst -sha256 -sign $PRIV | openssl base64 -A)
    curl \
        -d "$NAME=$VALUE" \
        -H "signature: $SIGNATURE" \
        -H "publickey: $PUB64" \
        $URL
}

function register() {
    echo "registering host if not already present"
    sign_api_request "${API_SERVER}/api/host" "hostname" $(hostname)
}

function grant() {
    USERID=$1
    echo "granting access to user $1"
    sign_api_request "${API_SERVER}/api/host/grantuser" "user" "$USERID"
}

# register or re-register host
register

# if userid, grant access to userid
if [ -n "$1" ]; then
    grant "$1"
fi

# Generate report
NOW=$(date +%s)
HOSTNAME=$(hostname)

PAYLOAD=$(echo "{\"timestamp\":$NOW, \"hostname\":\"$HOSTNAME\"}" | openssl rsautl -inkey $PRIV -sign | openssl base64 -A)

btrfs_exclude_subvolumes () {
	# only list files with size not null in subvolume
	path="$0"
	find "$path" \
		$(btrfs filesystem du --raw "$path" | tail -n +2 | awk '$2!=0 { printf("-path %s -ls -o ",$NF) }') \
		-path "$path"/inexistant -ls
}
export -f btrfs_exclude_subvolumes

path_to_exclude () {
	# exclude subvolume
	#awk '/ path /{ printf "-path /%s -prune -o ",$NF }'
	# OR
	# call function to list only files from this subvolume
	awk '/ path /{ printf "-path /%s -exec bash -c btrfs_exclude_subvolumes {} ; -prune -o ",$NF }'
}
export -f path_to_exclude


btrfs_find_exclude () {
	# find btrfs subvolume
	btrfs subvolume list -p / 2>/dev/null | path_to_exclude
}
export -f btrfs_find_exclude


find / \
	-path /proc -prune -o \
	-path /sys -prune -o \
	$(btrfs_find_exclude) \
	$(cat ~/.diskreport.exclude) \
	-ls \
| curl \
	-f \
	-X POST \
	-H "payload: $PAYLOAD" \
	-H "publickey: $PUB64" \
	-T- \
	$UPLOAD_SERVER/

# Does not work on docker centos:7
#| tee >(which perl &>/dev/null && perl -e 'my $c=0; my $time=time(); while (<STDIN>) {$c++; if ($time!=time()) {$time=time(); print "$c\n"}}' 1>&2) \
