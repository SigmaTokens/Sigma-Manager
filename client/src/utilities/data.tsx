import { AlertDetailsPopupProps } from '../utilities/props';

export const isMobile = window.innerWidth <= 768;

export const detailsGroups = ({ alert }: Pick<AlertDetailsPopupProps, 'alert'>) => [
  {
    title: 'Basic Information',
    items: [
      { label: 'Alert ID', value: alert.alert_id },
      { label: 'biscuit ID', value: alert.token_id },
      { label: 'Grade', value: alert.grade },
      {
        label: 'Alert Date',
        value: new Date(parseInt(alert.alert_epoch)).toLocaleString(),
      },
    ],
  },
  {
    title: 'Access Details',
    items: [
      { label: 'Accessed By', value: alert.accessed_by },
      { label: 'Location', value: alert.location },
      { label: 'File Name', value: alert.file_name },
    ],
  },
  {
    title: 'Agent Information',
    items: [{ label: 'Agent', value: `${alert.agent_id} | ${alert.agent_name}` }],
  },
];
