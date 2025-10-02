"use client";

import { useEffect, useState, useCallback } from "react";
import { Advocate, AdvocateApiResponse } from "../types/advocate";
import { useDebounce } from "../hooks/useDebounce";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // Show pagination with our 15 advocates

  const fetchAdvocates = useCallback(
    async (
      query: string = "",
      sortField?: string,
      sortDirection?: string,
      page?: number
    ) => {
      if (query) {
        setSearching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.append("search", query);
        if (sortField) {
          params.append("sort", sortField);
          params.append("direction", sortDirection || "asc");
        }
        params.append("page", (page || currentPage).toString());
        params.append("limit", pageSize.toString());

        const url = `/api/advocates${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch advocates");
        }

        const data: AdvocateApiResponse = await response.json();
        setFilteredAdvocates(data.data || []);
        setAdvocates(data.data || []);
        setTotalCount(data.total || data.data?.length || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    [currentPage, pageSize]
  ); // Initial load
  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  // Debounced search function for performance
  const debouncedSearch = useDebounce((query: string) => {
    fetchAdvocates(query);
  }, 300);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    // Trigger debounced search
    debouncedSearch(newSearchTerm);
  };

  const onReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setSortField("");
    setSortDirection("asc");
    fetchAdvocates(); // Fetch all advocates without query
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    setCurrentPage(1); // Reset to first page when sorting

    // Immediately fetch with new sort parameters
    fetchAdvocates(searchTerm, field, newDirection, 1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAdvocates(searchTerm, sortField, sortDirection, page);
  };

  if (loading && filteredAdvocates.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg
              className="animate-spin mx-auto h-12 w-12 text-blue-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6z"
              ></path>
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Solace Advocates
            </h1>
            <p className="text-gray-600">Loading advocates...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Solace Advocates
            </h1>
            <p className="text-red-600 font-medium mb-2">
              Failed to load advocates
            </p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solace Advocates
          </h1>
          <p className="text-gray-600">
            Find specialized healthcare advocates to support your needs
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Advocates
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, city, degree, or specialty (e.g., 'trauma', 'ADHD', 'MD')..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={onChange}
                  disabled={loading}
                  aria-describedby="search-help"
                />
                <div className="absolute top-0 left-0 h-[46px] flex items-center justify-center w-12 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {/* Search suggestions for better UX */}
                {!searchTerm && (
                  <div id="search-help" className="mt-3 text-sm text-gray-500">
                    <span className="font-medium">Popular searches:</span>{" "}
                    <button
                      className="text-blue-600 hover:text-blue-800 underline mx-1"
                      onClick={() => {
                        setSearchTerm("trauma");
                        debouncedSearch("trauma");
                      }}
                    >
                      trauma
                    </button>
                    <span className="text-gray-400">•</span>
                    <button
                      className="text-blue-600 hover:text-blue-800 underline mx-1"
                      onClick={() => {
                        setSearchTerm("ADHD");
                        debouncedSearch("ADHD");
                      }}
                    >
                      ADHD
                    </button>
                    <span className="text-gray-400">•</span>
                    <button
                      className="text-blue-600 hover:text-blue-800 underline mx-1"
                      onClick={() => {
                        setSearchTerm("anxiety");
                        debouncedSearch("anxiety");
                      }}
                    >
                      anxiety
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start pt-7">
              <button
                onClick={onReset}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Clear Search
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              {searching ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                <span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Search: &ldquo;{searchTerm}&rdquo;
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => handleSort("firstName")}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Name</span>
                      {sortField === "firstName" && (
                        <svg
                          className={`h-4 w-4 ${
                            sortDirection === "asc" ? "" : "rotate-180"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => handleSort("city")}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Location</span>
                      {sortField === "city" && (
                        <svg
                          className={`h-4 w-4 ${
                            sortDirection === "asc" ? "" : "rotate-180"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => handleSort("degree")}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Credentials</span>
                      {sortField === "degree" && (
                        <svg
                          className={`h-4 w-4 ${
                            sortDirection === "asc" ? "" : "rotate-180"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Specialties
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => handleSort("yearsOfExperience")}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Experience</span>
                      {sortField === "yearsOfExperience" && (
                        <svg
                          className={`h-4 w-4 ${
                            sortDirection === "asc" ? "" : "rotate-180"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdvocates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg
                          className="h-8 w-8 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium">
                          No advocates found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm
                            ? "Try adjusting your search terms"
                            : "No advocates available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdvocates.map((advocate, index) => {
                    const advocateId = advocate.id || `advocate-${index}`;
                    return (
                      <tr
                        key={advocateId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {advocate.firstName} {advocate.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {advocate.city}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {advocate.degree}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {advocate.specialties
                              .slice(0, 2)
                              .map(
                                (specialty: string, specialtyIndex: number) => {
                                  // Color code specialties by type for better UX
                                  const getSpecialtyColor = (
                                    specialty: string
                                  ) => {
                                    if (
                                      specialty
                                        .toLowerCase()
                                        .includes("mental health") ||
                                      specialty.includes("anxiety") ||
                                      specialty.includes("depression")
                                    ) {
                                      return "bg-blue-100 text-blue-800";
                                    }
                                    if (
                                      specialty
                                        .toLowerCase()
                                        .includes("trauma") ||
                                      specialty.includes("ptsd")
                                    ) {
                                      return "bg-purple-100 text-purple-800";
                                    }
                                    if (
                                      specialty
                                        .toLowerCase()
                                        .includes("substance") ||
                                      specialty.includes("addiction")
                                    ) {
                                      return "bg-red-100 text-red-800";
                                    }
                                    if (
                                      specialty
                                        .toLowerCase()
                                        .includes("pediatric") ||
                                      specialty.includes("children")
                                    ) {
                                      return "bg-pink-100 text-pink-800";
                                    }
                                    if (
                                      specialty
                                        .toLowerCase()
                                        .includes("women") ||
                                      specialty.includes("post-partum")
                                    ) {
                                      return "bg-rose-100 text-rose-800";
                                    }
                                    return "bg-green-100 text-green-800";
                                  };

                                  return (
                                    <span
                                      key={`${advocateId}-specialty-${specialtyIndex}`}
                                      className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getSpecialtyColor(
                                        specialty
                                      )}`}
                                      title={specialty} // Accessibility: full text on hover
                                    >
                                      {specialty.length > 20
                                        ? `${specialty.substring(0, 18)}...`
                                        : specialty}
                                    </span>
                                  );
                                }
                              )}
                            {advocate.specialties.length > 2 && (
                              <span
                                className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 cursor-help"
                                title={`Additional specialties: ${advocate.specialties
                                  .slice(2)
                                  .join(", ")}`}
                              >
                                +{advocate.specialties.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {advocate.yearsOfExperience}{" "}
                            {advocate.yearsOfExperience === 1
                              ? "year"
                              : "years"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`tel:${advocate.phoneNumber}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            {advocate.phoneNumber
                              .toString()
                              .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Always visible to prevent layout shift */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                {totalCount > pageSize ? (
                  <>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    {/* Placeholder to maintain consistent height */}
                    &nbsp;
                  </div>
                )}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalCount)}
                    </span>{" "}
                    of <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  {totalCount > pageSize ? (
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page numbers */}
                      {Array.from(
                        {
                          length: Math.min(5, Math.ceil(totalCount / pageSize)),
                        },
                        (_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNumber
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage >= Math.ceil(totalCount / pageSize)
                        }
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {/* Placeholder to maintain layout consistency */}
                      {totalCount === 0
                        ? "No results found"
                        : "All results shown"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
