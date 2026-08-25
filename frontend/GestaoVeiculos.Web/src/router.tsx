import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { ErroInesperadoPage } from '@/pages/ErroInesperadoPage'
import { NaoEncontradoPage } from '@/pages/NaoEncontradoPage'
import { VeiculoDetalhePage } from '@/pages/VeiculoDetalhePage'
import { VeiculoEditarPage } from '@/pages/VeiculoEditarPage'
import { VeiculoNovoPage } from '@/pages/VeiculoNovoPage'
import { VeiculosListaPage } from '@/pages/VeiculosListaPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    // Error boundary global: captura erros de renderização e falhas de rota.
    errorElement: <ErroInesperadoPage />,
    children: [
      { index: true, element: <Navigate to="/veiculos" replace /> },
      { path: 'veiculos', element: <VeiculosListaPage /> },
      { path: 'veiculos/novo', element: <VeiculoNovoPage /> },
      { path: 'veiculos/:id', element: <VeiculoDetalhePage /> },
      { path: 'veiculos/:id/editar', element: <VeiculoEditarPage /> },
      { path: '*', element: <NaoEncontradoPage /> },
    ],
  },
])
