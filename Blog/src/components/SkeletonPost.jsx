export const SkeletonPost = () => (
  <div className="animate-pulse flex flex-col md:flex-row gap-6 mb-10">
    <div className="w-full md:w-48 h-48 bg-slate-200 rounded-2xl"></div>
    <div className="flex-1 space-y-4 py-2">
      <div className="h-2 w-20 bg-slate-200 rounded"></div>
      <div className="h-6 w-full bg-slate-200 rounded"></div>
      <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
      <div className="flex gap-4 pt-4">
        <div className="h-8 w-8 rounded-full bg-slate-200"></div>
        <div className="h-4 w-24 bg-slate-200 rounded mt-2"></div>
      </div>
    </div>
  </div>
);