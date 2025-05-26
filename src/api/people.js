// src/api/people.js
import { api } from 'boot/axios'

export function getUsers() {
  return api.get('/users')
}

export function followUser(id) {
  return api.post(`/users/${id}/follow`)
}

export function unfollowUser(id) {
  return api.delete(`/users/${id}/follow`)
}
