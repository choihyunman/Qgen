import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import UploadedList from '@/components/upload/UploadedList/UploadedList';
import FileUploader from '@/components/upload/FileUpload/FileUploader';
import { TestType } from '@/types/generate';
import { UploadedFile } from '@/types/upload';
import { useGeneration } from '@/hooks/useGeneration';
import { useGenerateStore } from '@/stores/generateStore';
import ProblemTypeSelector from './ProblemTypeSelector';
import GradientTitle from '@/components/common/GradientTitle/GradientTitle';

const Generate = () => {
  const { workBookId } = useParams();
  const navigate = useNavigate();
  const numericWorkBookId = workBookId ? Number(workBookId) : undefined;

  const [testName, setTestName] = useState('');
  const [testTypes, setTestTypes] = useState<TestType[]>([
    { name: '객관식', count: 0 },
    { name: '주관식', count: 0 },
    { name: '서술형', count: 0 },
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const totalProblems = useMemo(() => {
    return testTypes.reduce((sum, type) => sum + type.count, 0);
  }, [testTypes]);

  const { isLoading, error, generatePaper } = useGeneration();
  const setGenerated = useGenerateStore((state) => state.setGenerated);

  const handleTypeClick = (typeName: string) => {
    setTestTypes((prev) =>
      prev.map((type) => ({
        ...type,
        count:
          type.name === typeName
            ? type.count === 0
              ? totalProblems >= 30
                ? 0
                : 1
              : 0
            : type.count,
      }))
    );
  };

  const handleCountChange = (typeName: string, newCount: number) => {
    if (newCount < 0) return;
    if (
      totalProblems -
        testTypes.find((t) => t.name === typeName)!.count +
        newCount >
      30
    )
      return;

    setTestTypes((prev) =>
      prev.map((type) => ({
        ...type,
        count: type.name === typeName ? newCount : type.count,
      }))
    );
  };

  const handleFileUpload = (file: File) => {
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      title: file.name,
      type: file.type,
    };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const handleLinkSubmit = (url: string) => {
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      title: url,
      type: 'URL',
    };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const handleTextSubmit = (text: string) => {
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      title: '직접 입력한 텍스트',
      type: 'Text',
    };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const handleFileDelete = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleGenerate = async () => {
    if (!numericWorkBookId) {
      alert('문제집 ID가 없습니다.');
      return;
    }

    const request = {
      workBookId: numericWorkBookId,
      title: testName || '제목없는 시험지',
      choiceAns: testTypes.find((t) => t.name === '객관식')?.count || 0,
      shortAns: testTypes.find((t) => t.name === '주관식')?.count || 0,
      OXAns: 0,
      wordAns: testTypes.find((t) => t.name === '서술형')?.count || 0,
      quantity: totalProblems,
    };

    try {
      const response = await generatePaper(request);
      if (response.success && response.data) {
        setGenerated(response.data);
        navigate(`/list/${numericWorkBookId}`);
      }
    } catch (err) {
      console.error('시험지 생성 실패:', err);
    }
  };

  return (
    <div>
      <div className='flex flex-col items-start justify-start min-h-screen w-full mx-auto gap-6'>
        {/* Title Section + Button */}
        <div className='flex justify-between items-center w-full'>
          <GradientTitle highlight='시험지' after='생성하기' />
          <Button
            onClick={handleGenerate}
            variant='filled'
            className={`px-8 py-3 ml-4 text-lg font-semibold relative overflow-hidden
              ${totalProblems !== 0 && uploadedFiles.length !== 0 && !isLoading ? 'btn-gradient-move text-white' : ''}
            `}
            disabled={
              totalProblems === 0 || uploadedFiles.length === 0 || isLoading
            }
          >
            {isLoading ? '생성 중...' : '시험지 생성하기'}
          </Button>
        </div>

        {/* Test Name Input Section */}
        <div className='w-full bg-white rounded-3xl shadow-sm p-6 md:col-span-2'>
          <h2 className='text-xl font-semibold mb-5'>시험지 이름</h2>
          <div className='border-b-1 border-gray-300 pb-2 transition-colors focus-within:border-[#754AFF]'>
            <input
              type='text'
              placeholder='제목없는 시험지'
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className='w-full bg-transparent border-none outline-none text-lg text-gray-800 placeholder-gray-400'
            />
          </div>
        </div>

        {/* File Upload and List Section */}
        <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-6'>
          <FileUploader
            onFileUpload={handleFileUpload}
            onLinkSubmit={handleLinkSubmit}
            onTextSubmit={handleTextSubmit}
            className='md:col-span-2'
            workBookId={numericWorkBookId ?? 0}
          />
          <div className='flex flex-col gap-6'>
            <UploadedList
              files={uploadedFiles}
              maxFiles={10}
              onDelete={handleFileDelete}
              className='md:col-span-1'
              showAddButton={false}
            />
            <ProblemTypeSelector
              testTypes={testTypes}
              totalProblems={totalProblems}
              onTypeClick={handleTypeClick}
              onCountChange={handleCountChange}
              className='md:col-span-1'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;
