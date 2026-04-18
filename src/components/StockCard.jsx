function StockCard({ stock, onBuy, onSell }) {
  return (
    <div className="relative bg-[#1a1a1a] border border-green-500/20 rounded-xl p-5 shadow-lg hover:shadow-green-500/10 transition-all duration-300">

      {/* Stock Name */}
      <h2 className="text-xl font-bold text-green-400 mb-2">
        {stock.name}
      </h2>

      {/* Price */}
      <p className="text-2xl font-semibold mb-4">
        ₹ {stock.price}
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onBuy(stock.id)}
          className="flex-1 bg-green-400 text-black font-bold py-2 rounded hover:bg-green-500 transition"
        >
          BUY
        </button>

        <button
          onClick={() => onSell(stock.id)}
          className="flex-1 bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition"
        >
          SELL
        </button>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none shadow-[0_0_30px_rgba(0,255,65,0.05)]" />

    </div>
  );
}

export default StockCard;