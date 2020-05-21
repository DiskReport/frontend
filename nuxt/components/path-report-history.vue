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
        }
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

            // limit series count and add Other serie
            var percent_limit=1.5; // warning, if 500 small files, only Other is visible. ok if file list to see detail/go in subfolder
            var limited_series=[]; // with "Other"
            var limited_diskreport_data={}; // intermediate series data
            for (var i=0; i<this.diskreport_data.ts.length; i++) {
                var timestamp=parseInt(this.diskreport_data.ts[i]);
                var tmp_list=[]
                for (var name in this.diskreport_data.data[timestamp]) {
                    value=parseInt(this.diskreport_data.data[timestamp][name][sortby]);
                    tmp_list.push({name:name,value:value})
                }
                // calculate Total size/count
                var total=0;
                for (var j=0; j<tmp_list.length; j++) {
                    total+=tmp_list[j].value;
                }
                // size/count limit
                var limit=total*1.5/100
                // calculate Other size/count
                var other_label='All others';
                var other_total=0;
                for (var j=0; j<tmp_list.length; j++) {
                    var name =tmp_list[j].name
                    var value=tmp_list[j].value
                    if (value > limit) {
                        // keep it
                        if (limited_diskreport_data[name]) {
                            limited_diskreport_data[name][timestamp]=value
                        } else {
                            limited_diskreport_data[name]={}
                            limited_diskreport_data[name][timestamp]=value
                        }
                    } else {
                        // adding to Other
                        other_total+=tmp_list[j].value;
                    }
                }
                // add Other
                if (other_total > 0) {
                    var name=other_label
                    var value=other_total
                    if (limited_diskreport_data[name]) {
                        limited_diskreport_data[name][timestamp]=value
                    } else {
                        limited_diskreport_data[name]={}
                        limited_diskreport_data[name][timestamp]=value
                    }
                } 
            }
            for (var name in limited_diskreport_data) {
                var serie={
                    tooltip: {
                        // do not set trigger to item, or set_ts will not have the point timestamp
                        trigger: 'axis',
                        formatter: function (params) {
                            console.log('TOTO-here')
                            console.log(params);
                            console.log(`${params.seriesName}<br>${params.marker} ${params.value.month}: ${params.value[params.seriesName]}`)
                            if (params.value[1] == 0) {
                                console.log('size 0 at this ts for '+params.seriesName)
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
                for (var i=0; i<this.diskreport_data.ts.length; i++) {
                    var timestamp=parseInt(this.diskreport_data.ts[i]);
                    var value;
                    if (limited_diskreport_data[name][timestamp]) {
                        value=parseInt(limited_diskreport_data[name][timestamp]);
                    } else {
                        value=0;
                    }
                    serie.data.push({value:[timestamp*1000,value]});
                }

                // graph serie depending on show filter
                if (show=='variation') {
                    // search if serie is constant or not
                    var first_value=null;
                    var value_has_changed=0;
                    for (var i = 0; i < serie.data.length; i++) {
                        let value=serie.data[i].value[1]
                        if (first_value==null) {
                            first_value=value;
                        } else if (first_value!=value) {
                            value_has_changed=1;
                            break;
                        }
                    }
                    if (value_has_changed==1) {
                        //console.log(name+": has changed");
                        //searching min value of serie
                        var min=undefined;
                        for (var i=0; i < serie.data.length; i++) {
                            var value=serie.data[i].value[1];
                            if (min==undefined) {
                                min=value;
                            }
                            if (value < min) {
                                min=value;
                            }
                        }
                        //setting values relative to min value
                        for (var i=0; i < serie.data.length; i++) {
                            serie.data[i].value[1]-=min;
                        }
                        limited_series.push(serie);
                    }
                } else {
                    limited_series.push(serie);
                }
            }

            limited_series.sort(function(a, b) {
                // always put Other last
                if (a.name == 'Other') {
                    return 1
                }
                if (b.name == 'Other') {
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
                         //console.log('history tooltip:')
                         //console.log(params)
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
