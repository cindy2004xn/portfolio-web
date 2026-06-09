export default function TagFilter({ tags, selectedTags, onTagClick }) {
  const allSelected = selectedTags.length === 0;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onTagClick(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          allSelected
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onTagClick(tag)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTags.includes(tag)
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
