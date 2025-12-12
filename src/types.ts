export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    allDay: boolean;
}
