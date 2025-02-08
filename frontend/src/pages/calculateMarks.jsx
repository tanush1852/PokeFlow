import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from 'sonner';
import { toast } from "sonner";
import { AI_PROMPT } from '@/constant/options';
import { chatSession } from '@/service/AiModel';
import GoogleSignInDialog from './Googledialog';
import { doc,setDoc } from 'firebase/firestore';
import { db } from '@/service/fireBaseConfig';
import { useNavigate } from 'react-router-dom';

const ExamForm = () => {
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    chapter: '',
    totalMarks: '',
    correctAnswers: '',
    studentAnswers: ''
  });
  const[openDialog,setOpenDialog]=useState(false);
  const[loading,setLoading]=useState(false);
  const fieldLabels = {
    subject: 'Subject',
    chapter: 'Chapter',
    totalMarks: 'Total Marks',
    correctAnswers: 'Correct Answers',
    studentAnswers: 'Student Answers'
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

  
    
    const emptyFields = Object.entries(formData)
      .filter(([_, value]) => !value.trim())
      .map(([key, _]) => fieldLabels[key]);

    if (emptyFields.length > 0) {
      toast.error(
        <div className="space-y-2">
          <p>Please fill in the following required fields:</p>
          <ul className="list-disc pl-4">
            {emptyFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>,
        {
          duration: 4000,
          position: "bottom-right",
        }
      );
      return;
    }
    const user=localStorage.getItem('user')
    if(!user)
    {
      setOpenDialog(true);
      return;
    }

    // Process form if all fields are filled
    console.log('Form Data:', formData);
    toast.success('Form submitted successfully!', {
      position: "bottom-right",
    });
    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT
    .replace('{Subjectname}', formData.subject)
    .replace('{Chapname}', formData.chapter)
    .replace('{totmarks}', formData.totalMarks)
    .replace('{Idealans}', formData.correctAnswers)
    .replace('{studentans}', formData.studentAnswers);

    console.log('Final prompt:',FINAL_PROMPT)

    const result=await chatSession.sendMessage(FINAL_PROMPT);
    console.log(result?.response?.text());
    setLoading(false);
    saveData(result?.response?.text())
  };
  const saveData=async(Answer_data)=>{
    // Add a new document in collection "cities"
  setLoading(true);
  const user=JSON.parse(localStorage.getItem('user'))
  const docId=Date.now().toString();
  await setDoc(doc(db, "marksData", docId), {
  userQuery:(formData),
  outputQuery:JSON.parse(Answer_data),
  userEmail:user?.email,
  id:docId
  
});
navigate('/viewTrip/'+docId);
setLoading(false);


  }
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <>
      <Toaster />
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Student Answer Checker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject name"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter</Label>
              <Input
                id="chapter"
                placeholder="Enter chapter name"
                value={formData.chapter}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                placeholder="Enter total marks"
                value={formData.totalMarks}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correctAnswers">
                Correct Answer Key (comma separated)
              </Label>
              <Textarea
                id="correctAnswers"
                placeholder="Enter correct answers (e.g., A, B, C, D)"
                value={formData.correctAnswers}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentAnswers">
                Student Answer Key (comma separated)
              </Label>
              <Textarea
                id="studentAnswers"
                placeholder="Enter student answers (e.g., A, B, D, D)"
                value={formData.studentAnswers}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              Generate Score
            </Button>
          </form>
        </CardContent>
      </Card>


      <GoogleSignInDialog open={openDialog} onOpenChange={setOpenDialog} />

    </>
  );
};

export default ExamForm;