<script>
import axios from 'axios'
import PathReport from './path-report.vue';
import HostReportOption from './host-report-option.vue';

export default {
    name: 'host-select',
    props: ["host","path","ts"],
    data: function() {
        var select=this
        var options = [];
        axios.get('/api/host').then(function(response){
            for (var i=0 ; i<response.data.length ; i++) {
                options.push({id: response.data[i].uuid, label: response.data[i].hostname})
            }
            var found = false;
            if (options.length) {
                // check if store host is in options
                for(var i = 0; i < options.length; i++) {
                    if (options[i].id==select.host) {
                        found=true
                        break
                    }
                }
                // else, select first option
                if (found==false) {
                    select.setSelected(options[0].id)
                }
            }
        });
        return { options: options};
    },
    methods: {
        setSelected(host) {
            this.$store.commit('setHost',host)
        },
        focusInput: function () {
            //console.log('focusInput')
            this.$refs.hostselect.searchEl.focus();
        },
    },
    components: {
      'path-report': PathReport,
      'host-report-option': HostReportOption,
    }
}
</script>

<template>
  <div>
    <div v-if="options.length" id="host-select">
    
      <host-report-option
        v-if="host"
        />
      
      <v-select 
        v-bind:options="options"
        v-bind:value="host"
        @input="setSelected"
        :reduce="options=>options.id"
        ref="hostselect"
        v-shortkey="['h']"
        @shortkey.native="focusInput"
        v-b-tooltip.focus.top title="Press h to search path"
        style="float:left;width:250px"
        />
 
      <path-report
        v-if="host"
        v-bind:host="host"
        v-bind:path="path"
        v-bind:ts="ts"
        />

    </div>
    <div v-else>
       You have no host yet <b-link href="#" to="/host/add">Add a new host</b-link>
    </div>

  </div>
</template>

<style>
/* https://github.com/sagalbot/vue-select/issues/714
/  https://github.com/sagalbot/vue-select/issues/754
*/
</style>
