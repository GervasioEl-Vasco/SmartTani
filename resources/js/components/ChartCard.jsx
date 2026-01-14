import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const ChartCard = ({ title, data, dataKey, color, unit }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[300px]">
            <h3 className="text-gray-700 font-bold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                {title}
            </h3>
            
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="waktu" 
                            tick={{ fontSize: 10 }} 
                            interval="preserveStartEnd"
                        />
                        <YAxis 
                            tick={{ fontSize: 10 }} 
                            domain={['auto', 'auto']} 
                            unit={unit}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey={dataKey} 
                            stroke={color} 
                            fillOpacity={1} 
                            fill={`url(#color${dataKey})`} 
                            animationDuration={500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartCard;