export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ReminderForm: { reminderId?: string; initialDate?: string };
};

export type MainTabParamList = {
  Reminders: undefined;
  Calendar: undefined;
  Profile: undefined;
};
