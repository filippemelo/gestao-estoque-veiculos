import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { NaoEncontradoPage } from '@/pages/NaoEncontradoPage'
import { SchemasDemoPage } from '@/pages/SchemasDemoPage'
import { VeiculoDetalhePage } from '@/pages/VeiculoDetalhePage'
import { VeiculoEditarPage } from '@/pages/VeiculoEditarPage'
import { VeiculoNovoPage } from '@/pages/VeiculoNovoPage'
import { VeiculosListaPage } from '@/pages/VeiculosListaPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/veiculos" replace /> },
      { path: 'veiculos', element: <VeiculosListaPage /> },
      { path: 'veiculos/novo', element: <VeiculoNovoPage /> },
      { path: 'veiculos/:id', element: <VeiculoDetalhePage /> },
      { path: 'veiculos/:id/editar', element: <VeiculoEditarPage /> },
      // Rota temporária da Etapa 3 — remover depois.
      { path: 'schemas-demo', element: <SchemasDemoPage /> },
      { path: '*', element: <NaoEncontradoPage /> },
    ],
  },
])
