<script>
import axios from 'axios'
import PathLinks from './path-links.vue';
import PathReportPie from './path-report-pie.vue';
import PathReportHistory from './path-report-history.vue';

export default {
    name: 'path-report',
    props: ["host","path","ts"],
    data: function () {
        return {
            diskreport_data: null,
            trigger: 0
        }
    },
    mounted: function () {
        this.getDiskreportData();
    },
    watch: {
        host: function dataChanged(newData, oldData) {
            //console.log('path-report watch host')
            this.getDiskreportData()
        },
        path: function dataChanged(newData, oldData) {
            //console.log('path-report watch path')
            this.getDiskreportData()
        },
    },
    methods: {
        getDiskreportData () { 
            var self = this;

	    // init structure
            var diskreport_data = {
	        name_list: [],
	        data: {},
	        //ts: [],
            }

            var link='/api/report/?host='+self.host+'&path='+self.path;
            axios.get(link).then(function(response){

		// process data
	    	var ts_sorted=response.data['dates'];
                diskreport_data['ts']=ts_sorted;

	    	for (var ts_pos in ts_sorted) {
                    diskreport_data['data'][ts_sorted[ts_pos]]={};
	    	}

	    	// for each file get size for each timestamp
	    	for (var file in response.data['content']) {
	    	    diskreport_data['name_list'].push(file);
	    	
	    	    for (var ts_pos in ts_sorted) {
	    	        //console.log("searching ts: "+ts_sorted[ts_pos]);
	    		var ts_found=0;
	    		for (var i=0; i<response.data['content'][file].length; i++) {
	    		    if (ts_sorted[ts_pos] >= response.data['content'][file][i].min && (ts_sorted[ts_pos] <= response.data['content'][file][i].max || response.data['content'][file][i].max == 0)) {
	    		        //console.log(ts_sorted[ts_pos]+": Found between "+response.data['content'][file][i].min+" and "+response.data['content'][file][i].max+" size="+response.data['content'][file][i].size);
	    			diskreport_data['data'][ts_sorted[ts_pos]][file]={};
	    			diskreport_data['data'][ts_sorted[ts_pos]][file].s=response.data['content'][file][i].size;
	    			diskreport_data['data'][ts_sorted[ts_pos]][file].fc=response.data['content'][file][i].count;
	    			diskreport_data['data'][ts_sorted[ts_pos]][file].t=response.data['content'][file][i].type;
	    			ts_found=1;
	    			break;
	    		    } else {
	    			//console.log("It's not at position i="+i);
	    		    }
	    		}
	    	    }
	    	}

                // sort for constant series order
                diskreport_data.name_list.sort()

                // store diskreport_data
                //console.log('Storing diskreport_data:'+JSON.stringify(diskreport_data))
                if (self.diskreport_data) {
                  // delete previous data
                  delete(self.diskreport_data);
                }
                self.diskreport_data = diskreport_data;
                self.trigger++; //increment i used as trigger
                //self.$store.commit('setDiskreportData',diskreport_data)
            }, function(error){
                console.log('Vue.http.get('+link+') error: '+ error.statusText);
            });
        },
    },
    components: {
        'path-links': PathLinks,
        'path-report-pie': PathReportPie,
        'path-report-history': PathReportHistory,
    }
}
</script>

<template>
  <div>
      
    <path-links
        v-bind:diskreport_data="diskreport_data"
        v-bind:path="path"
        />

    <path-report-pie
        v-bind:diskreport_data="diskreport_data"
        v-bind:trigger="trigger"
        v-bind:ts="ts"
        />

    <path-report-history
        v-bind:diskreport_data="diskreport_data"
        v-bind:trigger="trigger"
        v-bind:ts="ts"
        v-bind:sortby="$store.state.sortby"
        v-bind:show="$store.state.show"
        v-bind:display="$store.state.display"
        v-bind:history_min="$store.state.history_min"
        />
  
  </div>
</template>
