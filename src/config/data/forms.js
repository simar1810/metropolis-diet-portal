import { format, parseISO } from "date-fns";
import { meetingTypeFieldsMap } from "../state-reducers/link-generator";

export const meetingEditFormControls = [
  {
    id: 1,
    label: "Meeting Topic",
    inputtype: 1,
    placeholder: "Enter Topic",
    name: "topics",
    getvalue: (obj) => obj.topics || ""
  },
  {
    id: 3,
    label: "Scheduled Date",
    placeholder: "Scheduled Date",
    type: "date",
    name: "date",
    inputtype: 1,
    getvalue: (obj) => obj.scheduleDate ? format(parseISO(obj.scheduleDate), "yyyy-MM-dd") : ""
  },
  {
    id: 4,
    label: "Time",
    placeholder: "Scheduled Time",
    type: "time",
    name: "time",
    inputtype: 8,
    getvalue: (obj) =>
      obj.scheduleDate ? format(parseISO(obj.scheduleDate), "HH:mm") : ""
  },
  {
    id: 5,
    label: "Repeat",
    inputtype: 4,
    name: "reOcurred",
    getvalue: (obj) => obj.reOcurred || false
  },
  {
    id: 6,
    label: "Meeting Description",
    inputtype: 3,
    placeholder: "Enter Description",
    name: "description",
    getvalue: (obj) => obj.description || ""
  },
  {
    id: 7,
    label: "Meeting Duration",
    type: "number",
    inputtype: 1,
    placeholder: "Meeting Duration (minutes)",
    name: "duration",
    getvalue: (obj) => obj.duration || ""
  },
  {
    id: 8,
    label: "Enter required Volume Points",
    type: "number",
    inputtype: 1,
    placeholder: "Enter Volume Points",
    name: "eventVolumePointAmount",
    getvalue: (obj) => obj.eventVolumePointAmount || ""
  },
  {
    id: 9,
    label: "Select Meeting Banner",
    type: "file",
    inputtype: 5,
    name: "banner",
    getvalue: (obj) => obj.banner || null
  },
  {
    id: 10,
    label: "Allowed Client Type",
    inputtype: 6,
    name: "allowed_client_type",
    options: [
      { id: 1, value: "client", name: "Client" },
      { id: 2, value: "coach", name: "Coach" }
    ],
    getvalue: (obj) => obj.allowed_client_type || ""
  },
  {
    id: 11,
    label: "Select A Client",
    inputtype: 7,
    name: "one_to_one_client_id",
    options: [],
    getvalue: (obj) => obj.one_to_one_client_id || ""
  },
  {
    id: 12,
    label: "Base Link",
    placeholder: "Please Enter Base Link",
    name: "baseLink",
    inputtype: 1,
    getvalue: (obj) => obj.baseLink || ""
  },
  {
    id: 13,
    label: "Allowed Client Roll Nos Series",
    type: "text",
    inputtype: 9,
    placeholder: "Enter roll no series",
    name: "allowed_client_rollnos",
    getvalue: (obj) => obj.allowed_client_rollnos || []
  }
];

export function selectMeetingEditFields(meetingType) {
  const fields = meetingTypeFieldsMap[meetingType];
  return meetingEditFormControls.filter(field => fields.includes(field.id));
}


export const meetingEditSelectControls = [
  {
    id: 1,
    label: "Meeting Type",
    options: [
      { id: 1, value: "quick", name: "Quick" },
      { id: 2, value: "scheduled", name: "Scheduled" },
      { id: 3, value: "reocurr", name: "Reoccur" },
      { id: 4, value: "event", name: "Event" },
    ],
    name: "meetingType",
    disabled: "true"
  },
  {
    id: 2,
    label: "Club Type",
    options: [
      { id: 1, value: "training", name: "Training" },
      { id: 2, value: "morning", name: "Morning" },
      { id: 3, value: "evening", name: "Evening" },
      { id: 4, value: "others", name: "Others" },
    ],
    name: "clubType"
  },
]

export const reviewVPFormControls = [
  {
    id: 1,
    label: "Roll No",
    placeholder: "Enter Roll No",
    type: "text",
    name: "rollno"
  },
  {
    id: 2,
    label: "Date",
    placeholder: "Enter Date",
    type: "date",
    name: "date"
  },
  {
    id: 3,
    label: "Points",
    placeholder: "Enter Requested Points",
    type: "number",
    name: "points"
  }
]

export const requestSubscriptionFormControls = [
  {
    id: 1,
    label: "Name",
    placeholder: "Enter Name",
    type: "text",
    name: "name"
  },
  {
    id: 2,
    label: "Roll No",
    placeholder: "Enter Roll No",
    type: "text",
    name: "rollno"
  },
  {
    id: 3,
    label: "Date Of Shopping",
    placeholder: "Enter Date",
    type: "date",
    name: "date"
  },
  {
    id: 4,
    label: "Subscription Amount",
    placeholder: "Enter Amount",
    type: "number",
    name: "amount"
  }
]