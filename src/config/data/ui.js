import { FaFacebookSquare, FaLinkedin, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { MdContactSupport } from "react-icons/md";
import { FaSquareInstagram } from "react-icons/fa6";

export const dashboardCards = {
  app: [
    { id: 1, title: "Active Clients", name: "members", icon: "/svgs/person.svg", link: "/coach/clients" },
    { id: 2, title: "Total Clients", name: "clients", icon: "/svgs/users-icon.svg", link: "/coach/clients" },
    { id: 3, title: "Meals Plans", name: "meals", icon: "/svgs/cutlery.svg", link: "/coach/meals/list-custom" },
    { id: 4, title: "Orders", name: "orders", icon: "/svgs/checklist.svg", link: "/coach/retail" },
  ],
  club: [
    { id: 1, title: "Meetings", name: "meetings", icon: "/svgs/checklist.svg", link: "/coach/club/meetings" }
  ]
};

export const coachPortfolioFields = [
  { id: 1, title: "Email ID", name: "email" },
  { id: 2, title: "Contact No.", name: "mobileNumber" },
  { id: 3, title: "Joined", name: "joiningDate" },
  { id: 4, title: "Coach ID", name: "coachId" },
  { id: 5, title: "Whitelabel", name: "whitelabel" },
]

export const coachPortfolioSocialLinks = [
  { id: 1, social: "Facebook", name: "facebookLink", icon: <FaFacebookSquare className="min-w-[24px] min-h-[24px] text-blue-400" /> },
  { id: 2, social: "Instagram", name: "instagramLink", icon: <FaSquareInstagram className="min-w-[24px] min-h-[24px] text-pink-500" /> },
  { id: 3, social: "LinkedIn", name: "linkedinLink", icon: <FaLinkedin className="min-w-[24px] min-h-[24px] text-blue-300" /> },
  { id: 4, social: "WhatsApp", name: "whatsappNumber", icon: <FaWhatsapp className="min-w-[24px] min-h-[24px] text-green-600" /> },
  { id: 5, social: "Youtube", name: "youtubeLink", icon: <FaYoutube className="min-w-[24px] min-h-[24px] text-[var(--accent-2)]" /> },
  { id: 6, social: "Support", name: "supportNumber", icon: <MdContactSupport className="min-w-[24px] min-h-[24px]" /> },
]

export const coachDetailsFields = [
  { id: 1, label: "Name", name: "name" },
  { id: 2, label: "Mobile No.", name: "mobileNumber" },
  { id: 3, label: "Email ID", name: "email" },
  // { id: 4, label: "Whitelabel", name: "whitelabel" },
  // { id: 4, label: "No. of Clients", name: "expectedNoOfClients" },
]

export const clientPortfolioFields = [
  { id: 1, title: "Email ID", name: "email" },
  { id: 2, title: "Contact No.", name: "mobileNumber" },
  { id: 3, title: "Joined", name: "joiningDate" },
  { id: 4, title: "Client ID", name: "clientId" },
  { id: 5, title: "DOB", name: "dob" },
  { id: 6, title: "Age", name: "age" },
  // { id: 7, title: "Height", name: "height" },
  { id: 8, title: "Gender", name: "gender", style: { textTransform: "capitalize" } },
  // { id: 7, title: "Weight Lost Till Date", name: "age" },
]

export const clientDetailsFields = [
  { id: 1, label: "Name", name: "name" },
  { id: 2, label: "Mobile No.", name: "mobileNumber", type: "number" },
  { id: 3, label: "Email", name: "email", type: "email" },
  { id: 4, label: "DOB", name: "dob", type: "date", format: "dd-mm-yyyy" },
  { id: 5, label: "Age", name: "age", type: "number" },
  {
    id: 6, label: "Gender", name: "gender", type: 4,
    options: [
      { id: 1, name: "Male", value: "male" },
      { id: 2, name: "Female", value: "female" },
    ]
  },
  // { id: 7, label: "Weight", name: "weight", type: 3 },
  { id: 8, label: "Height", name: "height", type: 2 },
]

export const clientOwnDetailsFields = [
  { id: 1, label: "Name", name: "name" },
  { id: 2, label: "Mobile No.", name: "mobileNumber", type: "number" },
  { id: 3, label: "Email", name: "email", type: "email" },
  { id: 4, label: "DOB", name: "dob", type: "date", format: "dd-mm-yyyy" },
  { id: 5, label: "Age", name: "age", type: "number" },
  {
    id: 6, label: "Gender", name: "gender", type: 4,
    options: [
      { id: 1, name: "Male", value: "Male" },
      { id: 2, name: "Female", value: "Female" },
    ]
  }
]

export const linkGeneratorFields = [
  { id: 1, label: "Meeting Topic", inputtype: 1, placeholder: "Enter Topic", name: "topics" },
  {
    id: 2, label: "Meeting Type", inputtype: 2, name: "meetingType", options: [
      { id: 1, title: "Quick", value: "quick" },
      { id: 2, title: "Scheduled", value: "scheduled" },
      { id: 3, title: "Reoccurring", value: "reocurr" },
      { id: 4, title: "Event", value: "event" },
      { id: 5, title: "One to One", value: "one_to_one" },
    ]
  },
  { id: 3, label: "Date", type: "date", inputtype: 1, name: "date" },
  { id: 4, label: "Time", type: "time", inputtype: 8, name: "time" },
  { id: 5, label: "Repeat", inputtype: 4, name: "reOcurred" },
  { id: 6, label: "Meeting Description", inputtype: 3, placeholder: "Enter Description", name: "description" },
  { id: 7, label: "Meeting Duration (minutes)", type: "number", inputtype: 1, placeholder: "Meeting Duration", name: "duration", min: 0 },
  { id: 8, label: "Enter required Volume Points", type: "number", inputtype: 1, placeholder: "Enter Volume Points", name: "eventVolumePointAmount" },
  { id: 9, label: "Select Meeting Banner", type: "file", inputtype: 5, name: "banner" },
  {
    id: 10, label: "Allowed Client Type", inputtype: 6, name: "allowed_client_type",
    options: [
      { id: 1, value: "client", name: "Client" },
      { id: 2, value: "coach", name: "Coach" },
    ]
  },
  {
    id: 11, label: "Select A Client", inputtype: 7, name: "one_to_one_client_id",
    options: []
  },
  {
    id: 12,
    label: "Allowed Client Roll Nos Series",
    type: "text",
    inputtype: 9,
    placeholder: "Enter roll no series",
    name: "allowed_client_rollnos"
  }
];

export const quickAddClientFormFields = [
  { id: 1, label: "Client Name", name: "name", placeholder: "Enter Name" },
  { id: 2, label: "Mobile Number", name: "mobileNumber", placeholder: " Mobile number" }
]

export const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

export const DAYS_EEEE = [
  "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday",
  "Saturday"
];

export const marathonTaskFields = [
  {
    id: 1,
    label: "Title",
    name: "title",
    type: "text",
    placeholder: "Enter document title",
  },
  {
    id: 2,
    label: "Description",
    name: "description",
    type: "textarea",
    placeholder: "Enter document description",
  },
  {
    id: 3,
    label: "Points",
    name: "points",
    type: "number",
    placeholder: "Enter points value",
  },
  {
    id: 4,
    label: "Video Submission",
    name: "videoSubmission",
    type: "checkbox",
  },
  {
    id: 5,
    label: "Photo Submission",
    name: "photoSubmission",
    type: "checkbox",
  },
]