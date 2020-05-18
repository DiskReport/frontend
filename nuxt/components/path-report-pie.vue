<script>
import {getRGB,human_size} from '../plugins/diskreport'

function is_dir (data,name) {
    for (var i=0; i<data.length; i++) {
        var file=data[i]
        if (file.label == name) {
            if (file.type == 'd') {
                return true
            }
        }
    }
    return false
}

export default {
    name: 'path-report-pie',
    props: ["diskreport_data","trigger","ts"],
    data: function () {
        return {
          echart_pie_size: {},
          echart_pie_fc: {},
        }
    },
    watch: {
        // watch does not detect object changes, so we use a trigger
        trigger: function dataChanged(newData, oldData) {
            this.refresh()
        },
        ts: function dataChanged(newData, oldData) {
            this.refresh()
        },
    },
    methods: {
        refresh: function () {
            this.calc_echart_pie()
        },
        set_path: function (dir) {
	    this.$store.commit('setPath',this.$store.state.path+'/'+dir)
        },
        calc_echart_pie: function () {
            var pie_ts=this.ts

            // show last timestamp if asked ts not in list (host switch)
            if (! this.diskreport_data['ts'].includes(pie_ts)) {
                pie_ts=this.diskreport_data['ts'].slice(-1).pop();
            }

            var data_size_all=get_data_by(this.diskreport_data,'size')
            var data_fc_all=get_data_by(this.diskreport_data,'count')

            function get_data_by(diskreport_data,type) {
                var data_all=[]
                for (var name_index in diskreport_data.name_list) {
                    var name=diskreport_data.name_list[name_index];
                    if (diskreport_data.data[pie_ts][name]) {
                        if (type=='size') {
                            data_all.push({
                                name: name,
                                value: parseInt(diskreport_data.data[pie_ts][name].s)
                            });
                        }
                        if (type=='count') {
                            data_all.push({
                                name: name,
                                value: parseInt(diskreport_data.data[pie_ts][name].fc)
                            });
                        } 
                    }
                }
                return data_all
            }

 
            // cacl total size/fc
            var data_size_total = calcTotal(data_size_all)
            var data_fc_total = calcTotal(data_fc_all)

            function calcTotal (data) {
                var total=0;
                for (var i=0; i<data.length; i++) {
                    total+=data[i].value;
                }
                return total;
            }

            // filterData : remove too small parts and add percentages
            var data_size_top = filterData(data_size_all,1.5,data_size_total)
            var data_fc_top = filterData(data_fc_all,1.5,data_fc_total)

            function filterData (data,min_pie_percent,total){
                var data_top=[];
                var other_label='All others'
                var other_total=0;
                for (var i=0; i<data.length; i++) {
                    if (data[i].value>total*min_pie_percent/100) {
                        var percent=0;
                        if (data[i].value > 0) {
                            percent=data[i].value*100/total;
                        }
                        data_top.push({
                            name:data[i].name,
                            value:data[i].value,
                        });
                    } else {
                        other_total+=data[i].value;
                    }
                }
                if (other_total > 0) {
                    var percent=other_total*100/total;
                    data_top.push({
                        name:other_label,
                        value:other_total,
                    });
                }
                return data_top;
            }

            // convert to series
            var data_size = data_to_series(data_size_top)
            var data_fc   = data_to_series(data_fc_top)

            function data_to_series(data) {
                var legendData = [];
                var seriesData = [];
                var selected = {};
                for (var i = 0; i < data.length; i++) {
                    var name = data[i].name
                    var value = data[i].value
                    legendData.push(name);
                    seriesData.push({
                        name: name,
                        value: value,
                        itemStyle: {
                            color: getRGB(name) 
                        }
                    });
                    selected[name] = true //i < count_selected;
                }
                return {
                    legendData: legendData,
                    seriesData: seriesData,
                    selected: selected
                };
            }

            // return echart with data 

            // by size
            this.echart_pie_size={
                title: {
                    //text: 'By total size',
                    text: 'Total: '+human_size(data_size_total)+'b',
                    //subtext: 'by total size',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    //formatter: '{a} <br/>{b} : {c} ({d}%)'
	            formatter: function (params) {
                         //console.log('params'); console.log(params)
                         const param = params[0];
                         return (params.name+'<br/>Total size: '+human_size(params.value)+' ('+params.percent+'%)') 
                    },
                },
                series: [
                    {
                        name: 'Size',
                        type: 'pie',
                        radius: '70%',
                        center: ['50%', '60%'],
                        data: data_size.seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        label: {
                            alignTo: 'edge',
                        },
                    }
                ],
                animationDuration: 0,
                animationDurationUpdate: 0,
            }

            // by file count
            this.echart_pie_fc={
                title: {
                    text: 'Total: '+human_size(data_fc_total)+' files',
                    //text: 'By total files count',
                    //subtext: 'by total file count',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    //formatter: '{a} <br/>{b} : {c} ({d}%)'
	            formatter: function (params) {
                         const param = params[0];
                         return (params.name+'<br/>Total number of files: '+params.value+' ('+params.percent+'%)') 
                    },
                },
                series: [
                    {
                        name: 'Count',
                        type: 'pie',
                        radius: '70%',
                        center: ['50%', '60%'],
                        data: data_fc.seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        label: {
                            alignTo: 'edge',
                        },
                    }
                ],
                animationDuration: 0,
                animationDurationUpdate: 0,
            }

        },
        go_to_path: function (data) {
            var name=data.name
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
    <div style="clear:both;"></div>
    <div style="//background-color:purple;">
      <v-chart :options="echart_pie_size" v-on:click="go_to_path" style="float:left;width:50%; height:200px; //background-color:grey;" />
      <v-chart :options="echart_pie_fc"   v-on:click="go_to_path" style="float:left;width:50%; height:200px; //background-color:darkgrey;" />
    </div>
    <div style="clear:both;"></div>
  <!--
  -->
  </div>
</template>
