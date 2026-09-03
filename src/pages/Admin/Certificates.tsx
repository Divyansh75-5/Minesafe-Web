interface CertRecord {
  id: string;
  number: string;
  userName: string;
  module: string;
  score: number;
  issuedAt: string;
  status: 'valid' | 'revoked' | 'expired';
}

const mockCerts: CertRecord[] = [];

export default function AdminCertificates() {
  const certs = mockCerts;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <div className="flex gap-3">
          <select className="input max-w-xs">
            <option value="">All Modules</option>
            <option value="fire-safety">Fire & Explosion Safety</option>
            <option value="gas-leak">Gas Leak / Confined Space</option>
          </select>
          <button className="btn-primary">Export</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {certs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🏅</div>
            <p className="text-gray-500">
              No certificates yet. Certificates appear here when workers pass
              their training modules.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Certificate #</th>
                  <th>Worker</th>
                  <th>Module</th>
                  <th>Score</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {certs.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="font-mono text-sm">{c.number}</td>
                    <td className="font-medium">{c.userName}</td>
                    <td className="text-sm capitalize">
                      {c.module.replace('-', ' ')}
                    </td>
                    <td>{c.score}%</td>
                    <td className="text-sm">{c.issuedAt}</td>
                    <td>
                      <span className="badge-pass">{c.status}</span>
                    </td>
                    <td>
                      <button className="text-primary-600 hover:underline text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}