function getArrayOfViews(that) {
  var t = +that.model.get('type'),
      g = +window.state.user.gov,
      result = []

  var fieldGroups = {
    latLng = {
      viewConstr: function () {
        if(that.model.get('lat') && that.model.get('lng')) {
          var latLngModel = new LatLngModel({
            'lat': that.model.get('lat'),
            'lng': that.model.get('lng'),
            'b_type': that.model.get('b_type'),
            'icon_url': that.model.get('icon_url'),
            'name': that.model.get('name')
          })
          LatLngView = LatLngView.extend({ model: latLngModel })
          result.push({ latLng: LatLngView })
        }
      }
    },
    title = {
      viewConstr: TitleView,
      model: function () {
        return new Backbone.model({
          required: 'required'
        })
      }
    },
    description = {
      viewConstr: ,

    },
    money = {
      viewConstr: ,

    },
    currency = {
      viewConstr: ,

    },
    startDate = {
      viewConstr: ,

    },
    endDate = {
      viewConstr: ,

    },
    beneficiar = {
      viewConstr: ,

    },
    programID = {
      viewConstr: ,

    },
    nco = {
      viewConstr: ,

    },
    tag = {
      viewConstr: ,

    },
    photo = {
      viewConstr: ,

    },
    phone = {
      viewConstr: ,

    },
    admLevel = {
      viewConstr: ,

    },
    usrCountbl = {
      viewConstr: ,

    },
    age = {
      viewConstr: ,

    },
    support = {
      viewConstr: ,

    },
    supportFinishDate = {
      viewConstr: ,

    },
    sphere = {
      viewConstr: ,

    },
  }
  
}
var objectTypes = {
  'voting': {
    name: 'Голосування',
    fields: [
      'title', 'age', 'sphere'
    ]
  },
  '...'
}
