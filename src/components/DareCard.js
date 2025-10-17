export default function DareCard({ title, challenger, opponent, amount, status }) {
  const getStatusColor = (status) => {
    if (status.toLowerCase().includes("accept")) return "text-[#FF4A4A]";
    return "text-[#B0B0B0]";
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#1A1A1A] to-[#0E0E0E] border-[#2A2A2A] border rounded-[20px] p-4 mb-4 shadow-md">
      {/* Dare Title */}
      <h3 className="text-[#FFFFFF] font-semibold text-base text-center mb-3 font-['SF Pro Display']">{title}</h3>

      {/* User Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <img
            src={challenger.avatar}
            alt={challenger.name}
            className="w-8 h-8 rounded-full border border-[#2A2A2A]"
          />
          <span className="text-[#B0B0B0] text-sm font-['SF Pro Display']">@{challenger.username}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#B0B0B0] text-sm font-['SF Pro Display']">@{opponent.username}</span>
          <img
            src={opponent.avatar}
            alt={opponent.name}
            className="w-8 h-8 rounded-full border border-[#2A2A2A]"
          />
        </div>
      </div>

      {/* Tokens / Wagers */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-[#B0B0B0] flex items-center gap-1 font-['SF Pro Display']">
          <span className="opacity-80">💰</span> {amount}
        </div>
        <div className="text-[#B0B0B0] flex items-center gap-1 font-['SF Pro Display']">
          {amount} <span className="opacity-80">💰</span>
        </div>
      </div>

      {/* Status / Timer */}
      <div className={`text-center text-xs font-medium font-['SF Pro Display'] ${getStatusColor(status)}`}>
        {status}
      </div>
    </div>
  );
}
