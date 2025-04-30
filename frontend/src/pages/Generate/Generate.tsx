import { useState, useMemo } from 'react';
import BlurBackground from '../../components/layout/Background/BlurBackground';
import Button from '../../components/common/Button/Button';
import UploadedList from '@/components/upload/UploadedList/UploadedList';
import FileUploader from '@/components/upload/FileUpload/FileUploader';
import { TestType } from '@/types/generate';
import { UploadedFile } from '@/types/upload';

const GenerateTestpaper = () => {
  const [testName, setTestName] = useState('');
  const [problemTypes, setProblemTypes] = useState<TestType[]>([
    { name: '객관식', count: 0 },
    { name: '주관식', count: 0 },
    { name: '서술형', count: 0 },
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const totalProblems = useMemo(() => {
    return problemTypes.reduce((sum, type) => sum + type.count, 0);
  }, [problemTypes]);

  const handleTypeClick = (typeName: string) => {
    setProblemTypes((prev) =>
      prev.map((type) => ({
        ...type,
        count: type.name === typeName ? (type.count === 0 ? 1 : 0) : type.count,
      }))
    );
  };

  const handleCountChange = (typeName: string, newCount: number) => {
    if (newCount < 0) return;
    if (
      totalProblems -
        problemTypes.find((t) => t.name === typeName)!.count +
        newCount >
      8
    )
      return;

    setProblemTypes((prev) =>
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

  return (
    <BlurBackground>
      <div className='flex flex-col items-start justify-center min-h-screen py-10 px-4 max-w-2xl mx-auto'>
        {/* Title Section */}
        <h1 className='text-2xl font-bold text-[#754AFF] mb-10'>
          시험지 생성하기
        </h1>

        {/* Test Name Input Section */}
        <div className='w-full bg-white/50 rounded-lg p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-5'>시험지 이름</h2>
          <div className='border border-gray-300 backdrop-blur-md bg-white/30 rounded-lg p-3'>
            <input
              type='text'
              placeholder='제목없는 시험지'
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className='w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400'
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className='w-full bg-white/50 rounded-lg mb-8'>
          <FileUploader
            onFileUpload={handleFileUpload}
            onLinkSubmit={handleLinkSubmit}
            onTextSubmit={handleTextSubmit}
          />
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className='w-full bg-white/50 rounded-lg p-6 mb-8'>
            <UploadedList
              files={uploadedFiles}
              maxFiles={10}
              onDelete={handleFileDelete}
            />
          </div>
        )}

        {/* Problem Types and Count Selection Section */}
        <div className='bg-white/50 rounded-lg p-6 w-full mb-8'>
          <div className='flex justify-between items-center mb-5'>
            <h2 className='text-xl font-semibold'>문제 유형 및 개수 선택</h2>
            <span className='text-lg font-medium text-[#754AFF]'>
              총 {totalProblems}문제
            </span>
          </div>

          <div className='flex justify-between mb-4 w-full'>
            {problemTypes.map((type) => (
              <div
                key={type.name}
                className='relative flex flex-col items-center'
              >
                {/* Type Button Container */}
                <div className='relative mb-4'>
                  {/* Bottom shape */}
                  <div
                    className={`
                      absolute w-[130px] h-[65px] 
                      rounded-[30px]
                      ${
                        type.count > 0
                          ? 'bg-gradient-to-br from-[#754AFF] via-[#8B65FF] to-[#B3ADFF] shadow-[0_0_15px_rgba(117,74,255,0.3)]'
                          : 'bg-[#B3ADFF]'
                      }
                      backdrop-blur-[50%]
                      shadow-[0_1.2px_30px_rgba(69,42,124,0.1)]
                      transition-all duration-300 ease-in-out
                    `}
                  />

                  {/* Type Button */}
                  <button
                    onClick={() => handleTypeClick(type.name)}
                    className={`
                      relative w-[127px] h-[66px] 
                      rounded-[30px] 
                      translate-x-[4px]
                      cursor-pointer
                      ${
                        type.count > 0
                          ? 'bg-gradient-to-br from-white/20 via-white/15 to-white/5'
                          : 'bg-gradient-to-b from-white/10 via-white/5 to-transparent'
                      }
                      text-white font-pretendard font-bold text-xl leading-8 text-center
                      transition-all duration-300 ease-in-out
                      hover:scale-[1.02] active:scale-[0.98]
                      overflow-hidden
                      ${type.count > 0 ? 'shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]' : ''}
                    `}
                  >
                    {/* Glass effect layer */}
                    <div
                      className={`
                        absolute inset-0
                        rounded-[30px]
                        ${
                          type.count > 0
                            ? 'bg-gradient-to-br from-white/60 via-white/30 to-transparent'
                            : 'bg-gradient-to-b from-white/50 to-transparent'
                        }
                        blur-[70%]
                        border-[1.5px] 
                        ${
                          type.count > 0
                            ? 'border-white/90 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                            : 'border-white/75'
                        }
                        transition-all duration-300 ease-in-out
                      `}
                    />
                    <span
                      className={`
                      relative z-10 
                      transition-all duration-300
                      ${type.count > 0 ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}
                    `}
                    >
                      {type.name}
                    </span>
                  </button>
                </div>

                {/* Count Controls - Only shown when type is selected */}
                <div
                  className={`
                  flex items-center justify-center space-x-3
                  transition-all duration-300
                  ${type.count > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
                `}
                >
                  <button
                    onClick={() => handleCountChange(type.name, type.count - 1)}
                    className='w-8 h-8 rounded-full bg-[#764EFF]/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#764EFF]/70 transition-colors'
                    disabled={type.count === 0}
                  >
                    -
                  </button>
                  <span className='w-8 text-center text-black font-semibold'>
                    {type.count}
                  </span>
                  <button
                    onClick={() => handleCountChange(type.name, type.count + 1)}
                    className='w-8 h-8 rounded-full bg-[#764EFF]/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#764EFF]/70 transition-colors'
                    disabled={totalProblems >= 8}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className='text-sm text-gray-500 mb-4 text-left'>
            최대 8문제까지 생성 가능합니다.
          </p>
        </div>

        {/* Generate Button Section */}
        <div className='w-full flex justify-center'>
          <Button
            onClick={() => {}}
            className='px-8 py-3 text-lg font-semibold'
            disabled={totalProblems === 0 || uploadedFiles.length === 0}
          >
            시험지 생성하기
          </Button>
        </div>
      </div>
    </BlurBackground>
  );
};

export default GenerateTestpaper;
