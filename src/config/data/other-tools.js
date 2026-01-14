export const notesColors = [
  "#FFD8F4",
  "#D9E8FC",
  "#FFEADD",
  "#B0E9CA",
  "#FDE99D"
]

export const reminderFormInputs = [
  { id: 1, component: 1, label: "Title", placeholder: "Enter title", name: "topic" },
  { id: 2, component: 1, label: "Date", type: "date", name: "date" },
  { id: 3, component: 4, label: "Time", type: "time", name: "time" },
  { id: 4, component: 2, label: "Agenda", name: "agenda", placeholder: "Enter agenda" },
  {
    id: 5, component: 3, label: "Attendee Details", name: "attendeeType",
    options: [
      { id: 1, label: "Metro Polis Client", value: 1, valuex: "wz_client" },
      { id: 2, label: "Other", value: 2, valuex: "other_client" }
    ]
  },
]