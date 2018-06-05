new Vue({
  el: '#app',
  store,

  http: {
    root: 'https://cors-anywhere.herokuapp.com/https://atlas.api.barclays/open-banking/v2.1',
  },

  data() {
    return {
      watchId: null,
      geoOptions: { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 },
      origins: { lng: 0, lat: 0 },
      closest: [],
      noPosition: false,
      resources: [],
      loadingText: 'Loading...',
      percents: 0,
    };
  },

  async mounted() {
    this.$store.dispatch('setLoading', true);

    const atms = await this.api('atms');
    this.$store.dispatch('setATM', atms.ATM);
    this.resources.push('[1/2] ATMs loaded.');
    this.percents = 100;

    // const branches = await this.api('branches');
    // this.$store.dispatch('setBranches', branches.Branch);
    // this.resources.push('[2/2] Branches loaded.');
    // this.percents = 100;

    this.loadingText = 'Fetching geoposition...';
    this.resources = [];

    this.watchId = await navigator.geolocation.watchPosition(this.geoSuccess, this.geoError, this.geoOptions);
  },

  methods: {
    async api(service) {
      const data = await this.$http
        .get(service)
        .then(response => {
          const data = response.body.data[0].Brand[0];

          if (service === 'branches') {
            this.$store.dispatch('setBrandName', data.BrandName);
          }

          return data;
        })
        .catch(error => error);

      return data;
    },

    geoSuccess(position) {
      this.origins.lat = position.coords.longitude;
      this.origins.lng = position.coords.latitude;
    },

    geoError() {
      this.noPosition = true;
      this.$store.dispatch('setLoading', false);
    },

    async changeMap() {
      this.$store.dispatch('setLoading', true);

      this.closest = await this.$store.getters.getClosest({ origin: [this.origins.lat, this.origins.lng], num: 10 });

      this.$store.dispatch('setLoading', false);
    },

    onClickItem(e) {
      const id = e.target.closest('li').id;
      const atm = this.closest.find(el => el.atm.Identification === id);
      const LatLng = atm.atm.Location.PostalAddress.GeoLocation.GeographicCoordinates;
      const googleMapsUri = `https://www.google.com/maps/dir/?api=1&origin=${this.origins.lng},${
        this.origins.lat
      }&destination=${LatLng.Latitude},${LatLng.Longitude}`;

      window.open(googleMapsUri, '_blank');
    },

    /**
     * Addressee's name
     * House number and street name
     * City or town
     * Province, state or department and postal code
     * COUNTRY (please print in capitals & use English name)
     */
    makeAddress(address) {
      return [
        address.Country,
        address.BuildingNumber,
        address.StreetName,
        address.TownName && address.TownName.toUpperCase(),
        address.PostCode,
      ].join(' ');
    },
  },

  computed: {
    isLoading() {
      return this.$store.getters.isLoading;
    },
  },

  watch: {
    origins: {
      handler: function() {
        this.changeMap();
      },
      deep: true,
    },
  },
});
