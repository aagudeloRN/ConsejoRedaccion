import { Product } from '@/types';
import API_BASE_URL from '@/config/api';

const API_URL = `${API_BASE_URL}/products`;

export const productService = {
    async create(formData: FormData): Promise<Product> {
        const res = await fetch(`${API_URL}/`, {
            method: 'POST',
            body: formData, // Browser handles multipart headers automatically
        });
        if (!res.ok) throw new Error('Error creating product');
        return res.json();
    },

    async getByNewsId(newsId: number): Promise<Product[]> {
        const res = await fetch(`${API_URL}/news/${newsId}`);
        if (!res.ok) throw new Error('Error fetching products');
        return res.json();
    },

    async delete(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error deleting product');
    }
};
