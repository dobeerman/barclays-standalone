const store = new Vuex.Store({
  state: {
    isLoading: false,

    atms: [],
    branches: [],
    brandName: '',
  },

  actions: {
    setLoading: ({ commit }, payload) => commit('setLoading', payload),

    setATM: ({ commit }, payload) => commit('setATM', payload),

    setBranches: ({ commit }, payload) => commit('setBranches', payload),

    setBrandName: ({ commit }, payload) => commit('setBrandName', payload),
  },

  mutations: {
    setLoading: (state, payload) => (state.isLoading = payload),

    setATM: (state, payload) => (state.atms = payload),

    setBranches: (state, payload) => (state.branches = payload),

    setBrandName: (state, payload) => (state.brandName = payload),
  },

  getters: {
    isLoading: state => state.isLoading,

    getClosest: (state, { getAtms, getBranches }) => payload => {
      const { origin, num } = payload;
      const addDist = atm => {
        const { Latitude, Longitude } = atm.Location.PostalAddress.GeoLocation.GeographicCoordinates;
        return { atm, dist: LatLngDist(origin, [Latitude, Longitude]) };
      };
      const sortByDistance = R.sortBy(R.prop('dist'));
      const atmsSorted = sortByDistance(R.map(addDist, getAtms));
      const atmsSliced = R.slice(0, num || 10, atmsSorted);

      return atmsSliced;
    },

    getAtms: state => state.atms,

    getBranches: state => state.branches,

    getBrandName: (state, { getBranches }) => id => getBranches.find(el => el.Identification === id),
  },
});

function LatLngDist(p, q) {
  var R = 6371; // Earth radius in km

  var dLat = (q[0] - p[0]) * Math.PI / 180;
  var dLon = (q[1] - p[1]) * Math.PI / 180;

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p[0] * Math.PI / 180) * Math.cos(q[0] * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
