export default function LoadingStore() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', marginTop: '20px' }}>
      <div className="skeleton-deal skeleton" style={{ width: '100%', height: '250px', marginBottom: '20px', borderRadius: '24px' }}></div>
      <div style={{ display: 'flex', width: '100%', gap: '40px', marginTop: '20px' }}>
        <div className="skeleton" style={{ width: '300px', height: '400px', borderRadius: '20px', flexShrink: 0 }}></div>
        <div className="skeleton" style={{ flex: 1, height: '600px', borderRadius: '20px' }}></div>
      </div>
    </div>
  );
}
