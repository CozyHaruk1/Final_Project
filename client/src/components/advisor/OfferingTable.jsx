function OfferingTable({ offerings, onEdit, onDelete, onToggleAddDrop }) {
  if (offerings.length === 0) {
    return <p>No offerings found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Course</th>
          <th>Section</th>
          <th>Day/Time</th>
          <th>Room</th>
          <th>Instructor</th>
          <th>Seats Taken</th>
          <th>Seats Remaining</th>
          <th>Add/Drop</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {offerings.map((offering) => (
          <tr key={offering._id}>
            <td>
              {offering.courseId?.code} - {offering.courseId?.title}
            </td>
            <td>{offering.section}</td>
            <td>
              {offering.day} {offering.startTime}-{offering.endTime}
            </td>
            <td>{offering.room}</td>
            <td>{offering.instructor}</td>
            <td>{offering.seatsTaken} / {offering.seats}</td>
            <td>{offering.seatsRemaining}</td>
            <td>
              {offering.addDropOpen ? (
                <>
                  Open
                  {offering.addDropCloseDate && (
                    <> until {new Date(offering.addDropCloseDate).toLocaleDateString()}</>
                  )}
                </>
              ) : (
                "Closed"
              )}
            </td>
            <td>
              <button onClick={() => onEdit(offering)}>Edit</button>
              <button onClick={() => onDelete(offering)}>Delete</button>
              <button onClick={() => onToggleAddDrop(offering)}>
                {offering.addDropOpen ? "Close" : "Open"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OfferingTable;