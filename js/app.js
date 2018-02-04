var STORAGE_KEY = 'bookmarkedHeroes-user'
var BOOKMARK_CLASS = '<i class="fas fa-star"></i>';
var UNBOOKMARK_CLASS = '<i class="far fa-star"></i>';
var bookmarkedHeroStorage = {
  fetch(){
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },
  save(bookmarkedHeroes){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarkedHeroes));
  }
}
var app = new Vue({
  el: '#app',
  data: {
    heroes: [],
    bookmarkedHeroes: bookmarkedHeroStorage.fetch(),
    off: 0,
    footer: '',
    afterApi: false,
    search: ''
  },
  watch: {
    bookmarkedHeroes: {
      handler(bookmarkedHeroes){
        bookmarkedHeroStorage.save(bookmarkedHeroes);
        this.searchHero();
      },
      deep: true
    }
  },
  computed: {
    text(){
      if(this.search !== ""){
        return 'Click on star if you want to keep your Favorite Hero!';
      }
      else {
        return 'Search your favorite HERO!';
      }
    }
  },
  methods: {
    addBookmarkedHero(hero){
     this.bookmarkedHeroes.push(hero);
    },

    removeBookmarkedHero(hero){
      var index = this.bookmarkedHeroes.map(function(e) { return e.id; }).indexOf(hero.id);
      this.bookmarkedHeroes.splice(index, 1);
    },

    hasBookmarkedHero(hero){
      var index = this.bookmarkedHeroes.map(function(e) { return e.id; }).indexOf(hero.id);
      return index !== -1;
    },
    bookmarkHero(hero){
        if (this.hasBookmarkedHero(hero)){
          this.removeBookmarkedHero(hero);
          hero.star = UNBOOKMARK_CLASS;
        }
        else {
          hero.star = BOOKMARK_CLASS;
          this.addBookmarkedHero(hero);
        }
        this.$forceUpdate();
    },
    searchHero(){
      var self = this;
      if(this.search !== ""){
        var offset = this.off;
        var url = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=9b182ff77825966383bece03b26b7bcc&hash=f5ec867d20f987a5cab8219cf7fa8c23';
        var nameStartsWith = '&nameStartsWith=';
        axios({
          method:'GET',
          url: url+nameStartsWith+self.search,
          params: {
            offset: offset,
            limit: 12
          }
        }).then(function(response) {

          console.log(response.data.data.results.star);
          var heroes = response.data.data.results;
          self.heroes = heroes.map(function(item){
            item.star = self.hasBookmarkedHero(item) ? BOOKMARK_CLASS : UNBOOKMARK_CLASS;
            return item;
          });
          self.footer = response.data;
          self.afterApi = true;
          console.log(self.heroes);
        });
      }
      else {

          self.heroes = bookmarkedHeroStorage.fetch();
      }
    },
    pagination(value){
      if(value == 'next'){
        this.off = this.off + 12;
      }
      else {
        this.off = this.off - 12;
      }
      this.searchHero();
    },
    clearSearch(){
      this.search = "";
      if(bookmarkedHeroStorage.fetch().length <= 0){
        this.afterApi = true;
      }
      else {
        this.afterApi = false;
      }
    }
  },
  created(){
    this.searchHero();
  }
})
