const OptimizedProductList = memo(({ products }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const listRef = useRef();

  // Intersection Observer para carregar mais
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleRange(prev => ({
            ...prev,
            end: Math.min(prev.end + 20, products.length)
          }));
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = listRef.current?.lastElementChild;
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [products.length, visibleRange.end]);

  const visibleProducts = products.slice(visibleRange.start, visibleRange.end);

  return (
    <div ref={listRef}>
      {visibleProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});