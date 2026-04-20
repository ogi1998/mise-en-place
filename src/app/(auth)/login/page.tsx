'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { signIn } from '@/lib/auth';
import { useState } from 'react';

export default function LoginPage() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema)
	});

	async function onSubmit(data: LoginFormData) {
		setServerError(null);

		const { error } = await signIn(data.email, data.password);

		if (error) {
			setServerError(error.message);
			return;
		}

		router.push('/dashboard');
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
				<h1 className='text-2xl font-bold text-gray-900 mb-2'>Mise en Place</h1>
				<p className='text-gray-500 mb-8'>Sign in to your restaurant panel</p>

				<div className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
						<input
							{...register('email')}
							type='email'
							className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'
							placeholder='you@restaurant.com'
						/>
						{errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
						<input
							{...register('password')}
							type='password'
							onKeyDown={(e) => e.key === 'Enter' && handleSubmit(onSubmit)()}
							className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'
							placeholder='••••••••'
						/>
						{errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
					</div>

					{serverError && <p className='text-red-500 text-sm'>{serverError}</p>}

					<button
						onClick={handleSubmit(onSubmit)}
						disabled={isSubmitting}
						className='w-full bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50'>
						{isSubmitting ? 'Signing in...' : 'Sign in'}
					</button>
				</div>
			</div>
		</div>
	);
}
