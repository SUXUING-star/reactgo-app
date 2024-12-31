// src/components/LoadingSkeleton.jsx
function LoadingSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* 顶部欢迎区域骨架 */}
      <div className="bg-gray-200 rounded-xl h-48 mb-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧内容区骨架 */}
        <div className="lg:col-span-3">
          {/* 分类标签骨架 */}
          <div className="bg-white rounded-xl p-4 mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded-full"></div>
              ))}
            </div>
          </div>

          {/* 帖子列表骨架 */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* 右侧边栏骨架 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6">
            <div className="h-24 bg-gray-200 rounded mb-4"></div>
          </div>
          <div className="bg-white rounded-xl p-6">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;