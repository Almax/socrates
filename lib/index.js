'use strict'

/**
 * Module Dependencies
 */

var reducer = require('./reducer')
var resolve = require('./resolve')
var freeze = require('./freeze')
var handle = require('./handle')
var sliced = require('sliced')
var redux = require('redux')
var isArray = Array.isArray

/**
 * Redux methods
 */

var Middleware = redux.applyMiddleware
var Store = redux.createStore

/**
 * Export `Socrates`
 */

module.exports = Socrates

/**
 * Initialize `Socrates`
 *
 * @param {Array} middlewares
 * @param {Function} root reducer
 * @return {Function} socrates
 */

function Socrates (reduce) {
  reduce = reduce || handle()

  // create our redux client
  var redux = Store(reducer(reduce), {}, Middleware(resolve))

  // initialize a store
  function store (action) {
    var arrayContext = isArray(this)
    if (!arguments.length && !arrayContext) return freeze(redux.getState())
    var actions = arrayContext ? sliced(this) : sliced(arguments)
    actions = wrapEmitterStyle(actions)
    redux.dispatch.apply(redux, actions)
    return redux.getState()
  }

  // subscribe to changes
  store.subscribe = function subscribe (fn) {
    return redux.subscribe(function listener () {
      return fn(freeze(redux.getState()))
    })
  }

  return store
}

/**
 * Maybe wrap the emitter style
 * into a flux standard action
 *
 * @param {Array} actions
 * @return {Array}
 */

function wrapEmitterStyle (actions) {
  if (actions.length !== 2) return actions
  if (typeof actions[0] !== 'string') return actions
  return [{
    type: actions[0],
    payload: actions[1]
  }]
}
