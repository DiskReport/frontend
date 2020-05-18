<template>
  <div>
    <h2>Add a new host</h2>
    <h3>Tl;dr</h3>
    <pre class="mt-3 mb-0">
{{ sudo }}
{{ install }}
{{ crontab_oneliner }}
# {{ $auth.user.id }} is {{ $auth.user.username }} user id
{{ run }} {{ $auth.user.id }}
# Report will be available after a few seconds/minutes of processing
    </pre>
    <h3>Start terminal</h3>
    <p>Start a terminal/console on your OS (Linux and Mac)
      <br/>Login as root if you want a full disk report
      <pre class="mt-3 mb-0">{{ sudo }}</pre>
    </p>
    <h3>Install script</h3>
    <pre class="mt-3 mb-0">{{ install }}</pre>
    <h3>Setup daily report crontab</h3> 
    <p>
      <pre class="mt-3 mb-0">{{ crontab_edit }}</pre>
      Add in crontab:
      <pre class="mt-3 mb-0">{{ crontab_add }}</pre>
    </p>
    <h3>Grant access and generate first report</h3> 
    <p>We will now allow your user (internal id {{$auth.user.id}}) to read report from this host, while generating the first report:
      <pre class="mt-3 mb-0">{{ run }} {{ $auth.user.id }}</pre>
      <br/>Report will be available after a few seconds/minutes of processing
    </p>
    <h3>Configure exclusions</h3> 
    <p>If for any reason you want to exclude folders from report, create a file <code>~/diskreport.exclude</code> containing a list of excludes in the <code>find</code> format, each of them finishing by <code>-o[space]</code>:
    <pre>{{ exclude }}</pre>
    </p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        sudo: 'sudo su -',
        install: 'curl -# -o diskreport.sh https://www.diskreport.net/diskreport.sh\nchmod +x diskreport.sh',
        run: './diskreport.sh',
        crontab_edit: 'crontab -e',
        crontab_add: '# daily diskreport\n'+Math.floor(Math.random() * 61)+' '+Math.floor(Math.random() * 25)+' * * * ~/diskreport.sh',
        crontab_oneliner: '(crontab -l 2>/dev/null; echo -e "\\n#daily diskreport\\n'+Math.floor(Math.random() * 61)+' '+Math.floor(Math.random() * 25)+' * * * ~/diskreport.sh") | crontab -',
        exclude: '-path /media/networkshare -prune -o \\\n-path /otherdir -prune -o ',
      }
    }
  }
</script>
