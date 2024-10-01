import { useEffect, useState } from 'react';

function App() {
  const [userData, setUserData] = useState<any>([])
  const [data, setData] = useState<any>({});

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;

      // Check the command
      if (message.command === 'sendData') {
        // Update state with the data from the message
        setData(message.payload.specificUser);
        setUserData(message.payload.users)
      }
    });

  }, [])

  const handleInputChange = () => {
    // Send updated task data to VS Code extension
    window.vscode.postMessage({
      command: 'fetchApiData',
      payload: { users: userData, specificUser: data },
    });
  };

  return (
    <>
      <input type="text" style={{ marginBottom: 10 }} value={data} onChange={(e) => setData(e.target.value)} />
      <button style={{ marginBottom: 10 }} onClick={handleInputChange}>Submit</button>

      <table border={1} cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Company</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((user: any) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.age}</td>
              <td>{user.gender}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{`${user.address.address}, ${user.address.city}, ${user.address.state}, ${user.address.country}`}</td>
              <td>{`${user.company.name} (${user.company.title})`}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </>
  )
}

export default App
