import Vue from "vue";
import VueECharts from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/title'
import 'echarts/lib/component/axis'
import 'echarts/lib/component/timeline'
import 'echarts/lib/component/tooltip'
 
Vue.component("v-chart", VueECharts);
