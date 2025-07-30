// components/PaginationControls.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisiblePages; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#5e5a66]">
      <div className="text-sm text-[#928da0] mb-4 sm:mb-0">
        Showing {indexOfFirstItem}-{indexOfLastItem} of {totalItems} items
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border ${
            currentPage === 1
              ? 'border-[#5e5a66]/30 text-[#5e5a66] cursor-not-allowed'
              : 'border-[#5e5a66] text-[#f8f4f9] hover:bg-[#403c46] hover:cursor-pointer'
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium hover:cursor-pointer ${
              currentPage === page
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'text-[#f8f4f9] hover:bg-[#403c46]'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg border ${
            currentPage === totalPages
              ? 'border-[#5e5a66]/30 text-[#5e5a66]  cursor-not-allowed'
              : 'border-[#5e5a66] text-[#f8f4f9] hover:bg-[#403c46] hover:cursor-pointer'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;