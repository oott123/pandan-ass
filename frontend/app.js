var app = new Vue({
  el: '#app',
  data: {
    files: window._fileList,
    search: 'ass'
  },
  computed: {
    filteredFiles: function () {
      var that = this
      return this.files.filter(function (value) {
        return value.indexOf(that.search) > -1
      }).map(function (value) {
        return {
          name: value,
          ext: value.slice(-3).toUpperCase(),
          url: '../output/' + value
        }
      })
    }
  }
})
