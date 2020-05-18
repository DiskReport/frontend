<script>
export default {
    name: 'host-report-option',
    data: function() {
        return {
            sortby_options: [
                {text: 'Size', value: 's'},
                {text: 'File count', value: 'fc'}
            ],
            display_options: [
                {text: 'Stack', value: 'stack'},
                {text: 'Line', value: 'line'}
            ],
            show_options: [
                {text: 'All', value: 'all'},
                {text: 'Only if variation', value: 'variation'}
            ]
        }
    },
    computed: {
        sortby_selected: {
            get: function(){
                return this.$store.state.sortby;
            },
            set: function(value){
                this.$store.commit('setSortby', value)
            } 
        },
        show_selected: {
            get: function(){
                return this.$store.state.show;
            },
            set: function(value){
                this.$store.commit('setShow', value)
            } 
        },
        display_selected: {
            get: function(){
                return this.$store.state.display;
            },
            set: function(value){
                this.$store.commit('setDisplay', value)
            } 
        }
    }
}
</script>

<template>
  <div>
  
    <b-form-radio-group
      size="sm"
      id="btn-radio-sort"
      v-model="sortby_selected"
      :options="sortby_options"
      buttons
      name="radios-btn-sort"
    ></b-form-radio-group>
  
    <b-form-radio-group
      size="sm"
      id="btn-radio-display"
      v-model="display_selected"
      :options="display_options"
      buttons
      name="radios-btn-display"
    ></b-form-radio-group>
  
    <b-form-radio-group
      size="sm"
      id="btn-radio-sort"
      v-model="show_selected"
      :options="show_options"
      buttons
      name="radios-btn-show"
    ></b-form-radio-group>
  
  </div>
</template>

