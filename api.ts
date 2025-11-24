import { Market, Product, Order, User } from './types';

const BASE_URL = 'http://localhost:1243';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erro na requisição: ${response.status}`);
  }

  return response.json();
}

// Mappers
const mapProduct = (p: any): Product => ({
  id: String(p.id),
  name: p.nome,
  description: p.descricao,
  price: p.preco,
  image: p.imagemUrl,
  category: p.categoria,
  weight: p.peso,
  rating: 4.5,
});

const mapMarket = (m: any): Market => ({
  id: String(m.id),
  name: m.nome,
  rating: 4.5,
  deliveryTime: m.tempoEntrega,
  deliveryFee: m.frete,
  minOrder: 20,
  image: m.imagemUrl,
  coverImage: m.capaUrl || m.imagemUrl,
  categories: m.categorias || [],
  products: (m.produtos || []).map(mapProduct),
  isPromoted: false,
  tags: []
});

export const api = {
  login: async (email: string, senha: string) => {
    const data = await request<any>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: any) => {
    return request('/cadastro-cliente', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMarkets: async (): Promise<Market[]> => {
    try {
      const data = await request<any[]>('/empresas');
      return data.map(mapMarket);
    } catch (e) {
      console.error("Erro ao buscar mercados", e);
      return [];
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const data = await request<any[]>('/pedidos');
      return data.map((o: any) => ({
        id: String(o.id),
        date: new Date(o.dataPedido),
        total: o.valor,
        status: o.status,
        marketName: o.itens?.[0]?.produto?.empresa?.nome || "Supermercado",
        items: (o.itens || []).map((i: any) => ({
          id: String(i.produtoId),
          name: i.produto?.nome || "Produto",
          price: i.precoUnitario,
          quantity: i.quantidade,
          image: i.produto?.imagemUrl || "",
          category: i.produto?.categoria || "",
          marketId: String(i.produto?.empresaId),
          marketName: i.produto?.empresa?.nome || ""
        }))
      }));
    } catch (e) {
      return [];
    }
  },

  placeOrder: async (orderData: { itens: any[], total: number }) => {
    return request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
};