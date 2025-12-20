"use client";
import { useRouter } from "next/navigation";
import Pagination from "../components/Pagination";
import { useApiClient } from "../lib/api";

export default function ProductsPage() {
  const api = useApiClient();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    load();
  }, [page, q]);

  async function load() {
    const res = await api.fetchProducts({ page, pageSize: 10, q });
    setProducts(res.data || []);
    setTotal(res.total || 0);
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="border rounded px-3 py-1"
          />
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={() => router.push("/admin/products/new")}
          >
            New
          </button>
        </div>
      </header>

      <div className="bg-white rounded-md shadow-sm p-4">
        <Table
          columns={["ID", "Title", "Category", "Price", "Stock", "Actions"]}
          data={products.map((p) => [
            p.id,
            p.title,
            p.category || "-",
            `₹ ${p.price}`,
            p.stock,
            p,
          ])}
          renderRow={(row) => (
            <tr key={row[0]} className="hover:bg-gray-50">
              <td className="p-2">{row[0]}</td>
              <td className="p-2">{row[1]}</td>
              <td className="p-2">{row[2]}</td>
              <td className="p-2">{row[3]}</td>
              <td className="p-2">{row[4]}</td>
              <td className="p-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/products/${row[0]}`)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          )}
        />

        <div className="mt-4">
          <Pagination
            page={page}
            total={total}
            pageSize={10}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
