import { useSubjects } from "./subjects/hooks/useSubjects";
import SubjectsPage from "./subjects/SubjectsPage";

export default function Subjects() {
  const props = useSubjects();
  return <SubjectsPage {...props} />;
}
