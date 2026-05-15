import client from './client'

export const listDockters = (q) => client.get('/api/dockters', { params: q ? { q } : {} })
export const getDockter = (id) => client.get(`/api/dockters/${id}`)
