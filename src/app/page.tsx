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

  const fetchAdvocates = useCallback(async (query?: string) => {
    try {
      setSearching(true);
      setError(null);
      
      const url = new URL("/api/advocates", window.location.origin);
      if (query && query.trim()) {
        url.searchParams.set("query", query.trim());
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch advocates: ${response.status}`);
      }
      
      const jsonResponse: AdvocateApiResponse = await response.json();
      setAdvocates(jsonResponse.data);
      setFilteredAdvocates(jsonResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  // Initial load
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
    fetchAdvocates(); // Fetch all advocates without query
  };

  if (loading) {
    return (
      <main style={{ margin: "24px" }}>
        <h1>Solace Advocates</h1>
        <p>Loading advocates...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ margin: "24px" }}>
        <h1>Solace Advocates</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </main>
    );
  }

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        {searchTerm && (
          <p>
            Searching for: <span>{searchTerm}</span>
          </p>
        )}
        <input 
          style={{ border: "1px solid black", marginRight: "8px" }} 
          value={searchTerm}
          onChange={onChange}
          placeholder="Search advocates..."
          disabled={loading}
        />
        <button onClick={onReset} disabled={loading}>
          Reset Search
        </button>
        {searching && <span style={{ marginLeft: "8px" }}>Searching...</span>}
      </div>
      <br />
      <p>Showing {filteredAdvocates.length} of {advocates.length} advocates</p>
      <br />
      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
          <th>City</th>
          <th>Degree</th>
          <th>Specialties</th>
          <th>Years of Experience</th>
          <th>Phone Number</th>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate, index) => {
            const advocateId = advocate.id || `advocate-${index}`;
            return (
              <tr key={advocateId}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((specialty: string, specialtyIndex: number) => (
                    <div key={`${advocateId}-specialty-${specialtyIndex}`}>
                      {specialty}
                    </div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
