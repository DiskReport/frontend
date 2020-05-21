<script>
import {getRGB,human_size} from '../plugins/diskreport'

function formatDate(d) {
    var month = d.getMonth();
    var day = d.getDate();
    var hour = d.getHours();
    var min = d.getMinutes();
    month = month + 1;
    month = month + "";
    if (month.length == 1)
    {
        month = "0" + month;
    }
    day = day + "";
    if (day.length == 1)
    {
        day = "0" + day;
    }
    min = min + "";
    if (min.length == 1)
    {
        min = "0" + min;
    }
    return d.getFullYear()+'-'+month+'-'+day+'\n'+hour+':'+min;
}

export default {
    name: 'path-report-history',
    props: ["diskreport_data","trigger","ts","sortby","show","display","history_min"],
    data: function () {
        return {
            echart_history: {},
        }
    },
    watch: {
        // watch does not detect object changes, so we use a trigger
        trigger: function dataChanged(newData, oldData) {
            this.refresh()
        },
        sortby: function () {
            this.refresh()
        },
        show: function () {
            this.refresh()
        },
        display: function () {
            this.refresh()
        },
        //history_min: function () {
        //    this.refresh()
        //}
    },
    methods: {
        refresh: function () {
            this.calc_echart_history(this)
        },
        set_path: function (dir) {
	    this.$store.commit('setPath',this.$store.state.path+'/'+dir)
        },
        set_ts: function (ts) {
            if (this.$store.state.ts == ts) {
            } else {
	        this.$store.commit('setTimestamp',ts)
            }
        },
        datazoom_event: function (evt) {
            this.$store.commit('setHistoryMin',evt.start)
        },
        calc_echart_history: function (root) {
            // define defaut axis timestamp
            var axis_ts=0;
            if (this.ts) {
                axis_ts=this.ts
            } else {
                //console.log('taking last')
                axis_ts=this.diskreport_data['ts'].slice(-1).pop();
            }

            var sortby=this.sortby;
            var show=this.show;
            var display=this.display;
            var datazoom_start=this.history_min;

            // BEGIN V2
            var limited_series=[]; // with "Other"

            // work on a copy of diskreport_data:
            var diskreport_data = JSON.parse(JSON.stringify(this.diskreport_data));

            // TODO: forgot before datazoom_start
            // will nee to get timestamp or convert percent to timestamp, and enable history_min trigger
            //console.log("forgot before datazoom")
            //for (var i=0; i<diskreport_data.ts.length; i++) {
            //    var timestamp=diskreport_data.ts[i];
            //    console.log("timestamp: "+timestamp)
            //    console.log("datazoom_start: "+datazoom_start)
            //    console.log("*1000 ?")
            //    if (timestamp < datazoom_start) {
            //        console.log("deleting timestamp :"+timestamp)
            //        delete(diskreport_data.data[timestamp])
            //    }
            //}

            // set value to 0 if no value at timestamp
            for (var i in diskreport_data.name_list) {
                var name=diskreport_data.name_list[i];
                for (var i=0; i<diskreport_data.ts.length; i++) {
                    var timestamp=parseInt(diskreport_data.ts[i]);
                    //console.log("name: "+name+" / timestamp: "+timestamp)
                    if (! diskreport_data.data[timestamp][name]) {
                        //console.log("name "+name+"does not exist at timestamp "+timestamp+" : setting default to zero")
                        if (sortby=='s') { 
                            diskreport_data.data[timestamp][name]={ s: 0 };
                        } else if (sortby=='fc') {
                            diskreport_data.data[timestamp][name]={ fc: 0 };
                        } else {
                            alert("unknown sortby "+sortby)
                        }
                    }
                }
            }

            // forgot if no variation
            if (show=='variation') {
                for (var i in diskreport_data.name_list) {
                    var name=diskreport_data.name_list[i];
                    var has_change=false
                    //var previous_value=undefined
                    var min=undefined
                    var max=undefined
                    for (var i=0; i<diskreport_data.ts.length; i++) {
                        var timestamp=parseInt(diskreport_data.ts[i]);
                        //console.log("name: "+name+" / timestamp: "+timestamp)
                        if (diskreport_data.data[timestamp][name]) {
                            var value=diskreport_data.data[timestamp][name][sortby];
                            if (min==undefined) {
                                min=value;
                            }
                            if (max==undefined) {
                                max=value;
                            }
                            if (value < min) {
                                min=value
                            }
                            if (value > min) {
                                max=value
                            }
                        } else {
                            alert("1: name "+name+" does not exist at timestamp "+timestamp+". this should not appear because value should be set to 0 at missing timestamps")
                        }
                    }
                    // remove it has no changed
                    if (min==max) {
                        //console.log("name "+name+" did not change, removing it…")
                        for (var i=0; i<diskreport_data.ts.length; i++) {
                            var timestamp=parseInt(diskreport_data.ts[i]);
                            delete(diskreport_data.data[timestamp][name])
                        }
                        //skip next step
                        continue
                    }
                    // keep only diff from min
                    for (var i=0; i<diskreport_data.ts.length; i++) {
                        var timestamp=parseInt(diskreport_data.ts[i]);
                        // minus min
                        diskreport_data.data[timestamp][name][sortby]-=min;
                    }
                }
            }

            // limit series count/add other serie
            // for each ts
            var other_used=false;
            var other_name='All others';
            for (var t=0; t<diskreport_data.ts.length; t++) {
                var timestamp=parseInt(diskreport_data.ts[t]);
                // first loop: calc total
                var total=0;
                for (var n in diskreport_data.name_list) {
                    var name=diskreport_data.name_list[n];
                    if (diskreport_data.data[timestamp][name]) {
                        total+=parseInt(diskreport_data.data[timestamp][name][sortby])
                    }
                }
                //console.log("total at timestamp: "+timestamp+" : "+total)
                // define limit
                var limit=total*1.5/100;
                var other_total=0;
                // second loop: clean too small and add them to All others
                for (var n in diskreport_data.name_list) {
                    var name=diskreport_data.name_list[n];
                    if (diskreport_data.data[timestamp][name]) {
                        var value=parseInt(diskreport_data.data[timestamp][name][sortby])
                        if (value < limit) {
                            // add it to All others
                            other_total+=value;
                            // and remove it
                            delete(diskreport_data.data[timestamp][name])
                        }
                    }
                }
                // add All others
                if (other_total > 0) {
                    other_used=true;
                    //console.log("other_total at timestamp: "+timestamp+" : "+other_total)
                    if (sortby=='s') {
                        diskreport_data.data[timestamp][other_name]={t: '-', s: other_total };
                    } else if (sortby=='fc') {
                        diskreport_data.data[timestamp][other_name]={t: '-', fc: other_total };
                    } else {
                        alert("unknown sortby "+sortby)
                    }
                }
            }
            // add 'All others' if it was used
            if (other_used) {
                diskreport_data.name_list.push(other_name)
            }

            // convert to series
            for (var i in diskreport_data.name_list) {
                var name=diskreport_data.name_list[i];
                var serie={
                    tooltip: {
                        // do not set trigger to item, or set_ts will not have the point timestamp
                        trigger: 'axis',
                        formatter: function (params) {
                            if (params.value[1] == 0) {
                                //console.log('size 0 at this ts for '+params.seriesName)
                                return null
                            }
                            return params.seriesName+'<br>'+human_size(params.value[1])
                        },
                    },
                    name:name,
                    color:getRGB(name),
                    data:[]
                };

                // setup display
                if (display=='line') {
                    serie.type='line';
                } else if (display=='stack') {
                    serie.type='line';
                    serie.stack='samename';
                    serie.areaStyle={
                        opacity: 1
                    };
                } else {
                    alert("unsupported display: "+display)
                }

                // here we keep all timestamp to set value to 0 otherwise
                for (var i=0; i<diskreport_data.ts.length; i++) {
                    var timestamp=parseInt(diskreport_data.ts[i]);
                    var value;
                    if (diskreport_data.data[timestamp][name]) {
                        value=parseInt(diskreport_data.data[timestamp][name][sortby]);
                    } else {
                        value=0;
                    }
                    serie.data.push({value:[timestamp*1000,value]});
                }
                limited_series.push(serie);
            }

            // sort series
            limited_series.sort(function(a, b) {
                // always put Other last
                if (a.name == 'All others') {
                    return 1
                }
                if (b.name == 'All others') {
                    return -1
                }
                return (a.name < b.name) ? -1 : 1;
            })

            //chart title
            var title='';
            if (sortby == 's') {
                title="Size history";
            } else if (sortby == 'fc') {
                title="File count history";
            } else {
                console.log("unsupported sortby")
            }
            if (show == 'variation') {
                title+=' (only variation)';
            }

            // return echart with data 

            // by size
            this.echart_history={
                title: {
                    //text: 'History',
                    text: title,
                    //subtext: 'by total size',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
	            formatter: function (params) {
                         let tooltip = '';
                         let total=0
                         params.forEach((s) => {
                           tooltip += `<div>${s.marker} ${s.seriesName}: ${human_size(s.value[1])}</div>`;
                           total+=s.value[1]
                         });
                         return tooltip+`<div><b>Total: ${human_size(total)}</b></div>`;
                    },
                    textStyle: {
                        fontSize: 10,
                    },
                },
                dataZoom: [
                    {
                        type: 'slider',
                        start: datazoom_start,
                        end: 100,
                    },
                ],
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                    axisPointer: {
                        value: axis_ts * 1000,
                        snap: true,
                        lineStyle: {
                            color: '#004E52',
                            opacity: 0.5,
                            width: 2
                        },
                        label: {
                            show: true,
                            formatter: function (params) {
                                if (params.value/1000 != Math.round(params.value/1000)) {
                                    console.log('selected timestamp is not round, do not use trigger: item in tooltip')
                                }
				root.set_ts(params.value/1000)
                                var date=new Date(params.value)
                                return formatDate(date);
                            },
                            backgroundColor: '#004E52'
                        },
                        handle: {
                            show: true,
                            color: '#004E52'
                        }
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: function (value,index) {
                            return human_size(value)
                        }
                    }
                },
                series: limited_series,
                animationDuration: 0,
            };

        },
        go_to_path: function (data) {
            var name=data.seriesName
            var is_dir=false;
            for (var ts in this.diskreport_data['data']) {
                if (this.diskreport_data['data'][ts][name] && this.diskreport_data['data'][ts][name].t == 'd') {
                    is_dir=true;
                    break;
                }
            }
            if (is_dir) {
                this.set_path(name)
            } else {
                this.$bvToast.toast(name+ ' is not a directory', {
                    title: 'Not a directory',
                    variant: 'warning',
                    solid: true
                })

            }
        },
    },
}
</script>

<template>
  <div>
        <div style="//background-color:green;">
          <v-chart :options="echart_history"
                   v-on:click="go_to_path"
                   v-on:datazoom="datazoom_event"
                   style="width:100%;height:400px;"
          />
        </div>
  </div>
</template>
