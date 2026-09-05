import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../statemanage/useConversation";

function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();

  // 🔥 Live search effect
  useEffect(() => {
    if (!search.trim()) return;
    if (!allUsers || allUsers.length === 0) return;

    const query = search.toLowerCase();

    const conversation = allUsers.find(
      (user) =>
        user?.fullname?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query)
    );

    if (conversation) {
      setSelectedConversation(conversation);
    }
  }, [search, allUsers, setSelectedConversation]);

  return (
    <div className="h-[10vh]">
      <div className="px-6 py-4">
        <div className="flex space-x-3">
          <label className="border border-gray-700 bg-slate-900 rounded-lg p-3 flex items-center gap-2 w-[80%]">
            <input
              type="text"
              className="grow outline-none bg-transparent text-white"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <FaSearch className="text-5xl p-2 hover:bg-gray-600 rounded-full duration-300" />
        </div>
      </div>
    </div>
  );
}

export default Search;
