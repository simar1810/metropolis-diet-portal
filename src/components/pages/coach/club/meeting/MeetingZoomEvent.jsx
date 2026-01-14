import { TableCell, TableRow } from "@/components/ui/table";
import { ISO__getTime } from "@/lib/formatter";

export default function MeetingZoomEvent({
  index,
  event
}) {
  const Component = selectEventComponent(event.event);
  return <Component index={index + 1} event={event} />
}

function selectEventComponent(eventType) {
  switch (eventType) {
    case 1:
      return Event1;
    case 2:
      return Event2;
    case 3:
      return Event3;
    case 4:
      return Event4;
    case 5:
      return Event5;
    case 6:
      return Event6;
  }
}

function Event1({ index, event }) {
  return <TableRow>
    <TableCell>{index}</TableCell>
    <TableCell>Meeting Started</TableCell>
    <TableCell></TableCell>
    <TableCell>{ISO__getTime(event.meeting_start_time)}</TableCell>
    <TableCell></TableCell>
  </TableRow>
}

function Event2({ index, event }) {
  return <TableRow>
    <TableCell>{index}</TableCell>
    <TableCell>Meeting Ended</TableCell>
    <TableCell></TableCell>
    <TableCell>{ISO__getTime(event.meeting_end_time)}</TableCell>
    <TableCell></TableCell>
  </TableRow>
}

function Event3({ index, event }) {
  return <TableRow>
    <TableCell>{index}</TableCell>
    <TableCell>Participant Left</TableCell>
    <TableCell>{event.participant_name}</TableCell>
    <TableCell>{ISO__getTime(event.participant_leave_time)}</TableCell>
    <TableCell>{event.leave_reason}</TableCell>
  </TableRow>
}

function Event4({ index, event }) {
  return <TableRow>
    <TableCell>{index}</TableCell>
    <TableCell>Participant Joined</TableCell>
    <TableCell>{event.participant_name}</TableCell>
    <TableCell>{ISO__getTime(event.joined_time)}</TableCell>
    <TableCell></TableCell>
  </TableRow>
}

function Event5({ index, event }) {
  return <TableRow>
    <TableCell>{index}</TableCell>
    <TableCell>Screen Sharing Started</TableCell>
    <TableCell>{event.sharing_started_by}</TableCell>
    <TableCell>{ISO__getTime(event.sharing_started_time)}</TableCell>
    <TableCell></TableCell>
  </TableRow>
}

function Event6({ index, event }) {
  return <TableRow>
    <TableCell>{index}</TableCell>
    <TableCell>Screen Sharing Ended</TableCell>
    <TableCell>{event.sharing_started_by}</TableCell>
    <TableCell>{ISO__getTime(event.sharing_ended_time)}</TableCell>
    <TableCell></TableCell>
  </TableRow>
}