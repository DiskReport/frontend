<script>
export default {
    name: 'path-links',
    data: function() {
        return {
            dir_options: [],
            focus: false, //do not open v-select choices by default
        }
    },
    props: ["path","diskreport_data"],
    mounted: function () {
        //console.log('mount')
        this.caclDirOptions()
        this.focusInput()
    },
    computed: {
        path_parents: function () {
            var self = this;
            var parents = []
            var path_part=self.path.split('/');
            for (var i=0; i<path_part.length-1; i++) {
            	var parent_path=path_part.slice(0,i+1).join('/');
            	var parent_name=decodeURIComponent(path_part[i]).replace(/\\ /g,' ');
                parents.push({path: parent_path, name: '/'+parent_name})
            }
            return parents
        },
        path_current: function () {
            var self = this;
            var path_part=self.path.split('/');
            var current_name=decodeURIComponent(path_part[path_part.length-1]).replace(/\\ /g,' ');
            return '/'+current_name
        },
    },
    watch: {
        diskreport_data: function() {
            this.caclDirOptions()
            this.focusInput()
        },
        path: function() {
            this.caclDirOptions()
            this.focusInput()
        }
    },
    methods: {
        setPath(path) {
            this.$store.commit('setPath',path)
        },
        setDir(path) {
            if (path) {
                this.$store.commit('setPath',path)
            } else {
                this.$store.commit('setPath','..')
            }
            this.focus=true
        },
        caclDirOptions: function() {
            var options = [];
            if (this.diskreport_data) {
                //console.log(this.diskreport_data)
                for (var i=0; i<this.diskreport_data.name_list.length; i++) {
                    var name=this.diskreport_data.name_list[i]
                    var is_dir=false;
                    for (var ts in this.diskreport_data['data']) {
                        if (this.diskreport_data['data'][ts][name] && this.diskreport_data['data'][ts][name].t=='d') {
                            is_dir=true;
                        }
                    }
                    if (is_dir && name != '') { 
                        options.push({id: this.path+'/'+name, label: name})
                    }
                }
            } else {
                console.log('no diskreport_data yet')
            }
            this.dir_options = options;
        },
        focusInput: function () {
            if (this.focus) {
                this.$refs.dirselect.searchEl.focus();
                this.focus=false; //disable focus for next v-select
            }
        },
        focusInputHotkey: function () {
            this.focus=true
            this.focusInput()
        },
    },
}
</script>

<template>
  <div>
      
    <b-button size="sm" variant="outline-primary"
        v-for="parent in path_parents" 
        v-bind:key="parent.path"
        v-on:click="setPath(parent.path)"
        >{{parent.name}}</b-button><!-- remove space
    --><b-button size="sm" variant="outline-primary"
        >{{path_current}}</b-button><!-- remove space
    --><v-select 
        class="dir-select"
        v-bind:options="dir_options"
        :reduce="options=>options.id"
        ref="dirselect"
        v-on:input="setDir"
        value="dir"
        style="display:inline-block;width:200px"
        v-b-tooltip.focus.top title="Press / to search path"
        v-shortkey="['/']"
        @shortkey.native="focusInputHotkey"
        />

  </div>
</template>

<style>
  .dir-select .vs__dropdown-menu {
    font-size: small;
    max-height: 300px;
    width: 300px;
  }
</style>
