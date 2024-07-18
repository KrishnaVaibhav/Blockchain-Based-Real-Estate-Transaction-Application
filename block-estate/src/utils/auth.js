export const fetchUsers = async () => {
  try {
    const response = await fetch("../data/users.json");
    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const validateUser = async (username, password) => {
  const users = await fetchUsers();
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  return user || null;
};
