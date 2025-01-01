import { useState, useEffect,useRef  } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    // 使用 ref 来追踪验证状态，避免重复验证
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verifyEmail = async () => {
            // 如果已经尝试过验证，直接返回
            if (verificationAttempted.current) {
                return;
            }
            verificationAttempted.current = true;

            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('无效的验证链接');
                return;
            }

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/verify-email?token=${token}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    }
                );
                
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || '验证失败，请重试');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
                setMessage('验证过程中出现错误，请稍后重试');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]); // 移除不必要的依赖

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                {status === 'verifying' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">正在验证邮箱...</p>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="text-center">
                        <div className="text-green-500 text-4xl mb-4">✓</div>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500 mt-2">即将跳转到登录页面...</p>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">✕</div>
                        <p className="text-red-600">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 text-blue-600 hover:text-blue-500"
                        >
                            返回登录页面
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail