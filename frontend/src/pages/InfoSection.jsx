import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const InfoSection = ({ data }) => {
  const {
    id,
    outputQuery: {
      assessment,
      chapter,
      student_marks,
      subject,
      total_marks
    },
    userEmail,
    userQuery: {
      studentAnswers,
      correctAnswers
    }
  } = data;

  const percentage = (student_marks / total_marks) * 100;
  const isPerfectScore = student_marks === total_marks;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Assessment Result</CardTitle>
          <Badge 
            variant={isPerfectScore ? "default" : "secondary"}
            className="text-lg"
          >
            {student_marks}/{total_marks}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          ID: {id}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Subject and Chapter Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Subject</p>
            <p className="font-medium capitalize">{subject}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Chapter</p>
            <p className="font-medium capitalize">{chapter}</p>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {isPerfectScore ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <AlertCircle className="text-yellow-500" />
            )}
            <h3 className="font-semibold">
              Score: {percentage}%
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {assessment.overall_comment}
          </p>
        </div>

        {/* Answer Comparison */}
        <div className="space-y-2">
          <h3 className="font-semibold">Answer Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Student's Answers:</p>
              <p className="font-mono mt-1">{studentAnswers}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Correct Answers:</p>
              <p className="font-mono mt-1">{correctAnswers}</p>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {assessment.strengths && assessment.strengths.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Strengths</h3>
            <ul className="list-disc list-inside space-y-1">
              {assessment.strengths.map((strength, index) => (
                <li key={index} className="text-sm">{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {assessment.weaknesses && assessment.weaknesses.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Areas for Improvement</h3>
            <ul className="list-disc list-inside space-y-1">
              {assessment.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm">{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          Student Email: {userEmail}
        </div>
        <div>
        <Link to={'/calculate'}>
        <Button >Check other answers</Button></Link>
        </div>
      </CardContent>
    </Card>
   
    
  );
};

export default InfoSection;