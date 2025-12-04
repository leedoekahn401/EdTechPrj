import { useEffect, useRef } from 'react';

export default function DesmosCalculator() {
  const elementRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    // 1. Tải script của Desmos nếu chưa có
    const scriptId = 'desmos-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      // Key demo miễn phí của Desmos
      script.src = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
      script.async = true;
      document.body.appendChild(script);
    }

    // 2. Khởi tạo máy tính khi script tải xong
    const initCalculator = () => {
      if (window.Desmos && elementRef.current && !calculatorRef.current) {
        calculatorRef.current = window.Desmos.GraphingCalculator(elementRef.current, {
          expressions: true,  // Bắt buộc hiện thanh nhập liệu
          keypad: true,       // Bắt buộc hiện bàn phím ảo
          settingsMenu: true, // Hiện cài đặt
          zoomButtons: true,
        });
      }
    };

    script.onload = initCalculator;
    // Nếu script đã có sẵn từ trước thì chạy luôn
    if (window.Desmos) initCalculator();

    // 3. Dọn dẹp khi tắt
    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
  }, []);

  return <div ref={elementRef} style={{ width: '100%', height: '600px' }} />;
}