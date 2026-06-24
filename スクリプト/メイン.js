/**
 * BIJOU CLINIC 銀座 - メインフロントエンドスクリプト
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Googleスプレッドシート連携（GAS）設定
  // ==========================================
  // ⚠️ ユーザー様がGASでデプロイしたWebアプリURLをここに貼り付けます
  const スプレッドシート送信先URL = 'https://script.google.com/macros/s/AKfycbwY7bNf6B12kg7PFFjHf1x5fhnvwOupBq3s6NRqZSqi74781AFuPFitAC2CFUOXr_68/exec';

  // ==========================================
  // 2. モバイルナビゲーション制御
  // ==========================================
  const モバイルメニューボタン = document.querySelector('.モバイルメニューボタン');
  const モバイルナビゲーション = document.querySelector('.モバイルナビゲーション');
  const モバイルメニュー項目一覧 = document.querySelectorAll('.モバイルメニュー項目');

  function モバイルメニュー切り替え() {
    モバイルメニューボタン.classList.toggle('有効');
    モバイルナビゲーション.classList.toggle('有効');
  }

  function モバイルメニュー閉じる() {
    モバイルメニューボタン.classList.remove('有効');
    モバイルナビゲーション.classList.remove('有効');
  }

  if (モバイルメニューボタン) {
    モバイルメニューボタン.addEventListener('click', モバイルメニュー切り替え);
  }

  モバイルメニュー項目一覧.forEach(項目 => {
    項目.addEventListener('click', モバイルメニュー閉じる);
  });

  // ==========================================
  // 3. スクロール時のフェードインアニメーション
  // ==========================================
  // フェードインさせたい要素をHTMLで定義する代わりに、主要なセクションやカードに動的にクラスを付与
  const 監視対象要素一覧 = document.querySelectorAll('.コンセプト分割配置, .強みカード, .施術カード, .ステップ項目, .フォーム背景枠');
  
  監視対象要素一覧.forEach(要素 => {
    要素.classList.add('フェードイン要素');
  });

  const 監視オプション = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const 監視コールバック = (監視エントリ一覧, 監視インスタンス) => {
    監視エントリ一覧.forEach(エントリ => {
      if (エントリ.isIntersecting) {
        エントリ.target.classList.add('表示');
        監視インスタンス.unobserve(エントリ.target); // 一度表示されたら監視を解除
      }
    });
  };

  const スクロール監視 = new IntersectionObserver(監視コールバック, 監視オプション);
  
  document.querySelectorAll('.フェードイン要素').forEach(要素 => {
    スクロール監視.observe(要素);
  });

  // ==========================================
  // 4. FAQ アコーディオン制御
  // ==========================================
  const アコーディオンヘッダー一覧 = document.querySelectorAll('.アコーディオンヘッダー');

  アコーディオンヘッダー一覧.forEach(ヘッダー => {
    ヘッダー.addEventListener('click', () => {
      const 項目 = ヘッダー.parentElement;
      const 回答 = ヘッダー.nextElementSibling;
      const 有効化状態 = 項目.classList.contains('有効');

      // 他の開いているアコーディオンを閉じる（オプション：1つだけ開く挙動）
      document.querySelectorAll('.アコーディオン項目.有効').forEach(開いている項目 => {
        if (開いている項目 !== 項目) {
          開いている項目.classList.remove('有効');
          開いている項目.querySelector('.アコーディオン回答').style.maxHeight = null;
        }
      });

      if (!有効化状態) {
        項目.classList.add('有効');
        回答.style.maxHeight = 回答.scrollHeight + 'px';
      } else {
        項目.classList.remove('有効');
        回答.style.maxHeight = null;
      }
    });
  });

  // ==========================================
  // 5. 問い合わせフォームのバリデーションと送信
  // ==========================================
  const 問い合わせフォーム = document.getElementById('問い合わせフォーム');
  const 送信ボタン = document.getElementById('送信ボタン');
  const 送信完了画面 = document.getElementById('送信完了画面');
  const 閉じるボタン = document.getElementById('閉じるボタン');

  // 入力要素
  const 入力お名前 = document.getElementById('お名前');
  const 入力フリガナ = document.getElementById('フリガナ');
  const 入力メールアドレス = document.getElementById('メールアドレス');
  const 入力電話番号 = document.getElementById('電話番号');
  const 入力希望プラン = document.getElementById('希望プラン');
  const 入力お問合せ内容 = document.getElementById('お問い合わせ内容');
  const 入力同意チェック = document.getElementById('同意チェック');

  // エラー出力要素
  const エラーお名前 = document.getElementById('お名前エラー');
  const エラーフリガナ = document.getElementById('フリガナエラー');
  const エラーメールアドレス = document.getElementById('メールアドレスエラー');
  const エラー電話番号 = document.getElementById('電話番号エラー');
  const エラー同意チェック = document.getElementById('同意チェックエラー');

  // バリデーションヘルパー関数
  function エラー表示(入力要素, エラー要素, メッセージ) {
    入力要素.classList.add('エラーあり');
    エラー要素.textContent = メッセージ;
    エラー要素.classList.add('有効');
  }

  function エラークリア(入力要素, エラー要素) {
    入力要素.classList.remove('エラーあり');
    エラー要素.textContent = '';
    エラー要素.classList.remove('有効');
  }

  // 個別のフィールドバリデーション
  function 検証お名前() {
    if (!入力お名前.value.trim()) {
      エラー表示(入力お名前, エラーお名前, 'お名前を入力してください。');
      return false;
    }
    エラークリア(入力お名前, エラーお名前);
    return true;
  }

  function 検証フリガナ() {
    const フリガナ値 = 入力フリガナ.value.trim();
    if (!フリガナ値) {
      エラー表示(入力フリガナ, エラーフリガナ, 'フリガナを入力してください。');
      return false;
    }
    // カタカナ・ひらがな・スペースのみ許容する簡易正規表現
    const カタカナ正規表現 = /^[ァ-ヶーぁ-ん\s 　]+$/;
    if (!カタカナ正規表現.test(フリガナ値)) {
      エラー表示(入力フリガナ, エラーフリガナ, 'フリガナはひらがな、またはカタカナで入力してください。');
      return false;
    }
    エラークリア(入力フリガナ, エラーフリガナ);
    return true;
  }

  function 検証メールアドレス() {
    const メール値 = 入力メールアドレス.value.trim();
    if (!メール値) {
      エラー表示(入力メールアドレス, エラーメールアドレス, 'メールアドレスを入力してください。');
      return false;
    }
    const メール正規表現 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!メール正規表現.test(メール値)) {
      エラー表示(入力メールアドレス, エラーメールアドレス, '正しいメールアドレスの形式で入力してください。');
      return false;
    }
    エラークリア(入力メールアドレス, エラーメールアドレス);
    return true;
  }

  function 検証電話番号() {
    const 電話値 = 入力電話番号.value.trim();
    if (!電話値) {
      エラー表示(入力電話番号, エラー電話番号, '電話番号を入力してください。');
      return false;
    }
    // ハイフンあり・なし両対応の数字チェック
    const 電話正規表現 = /^(0[5-9]0[-(]?[0-9]{4}[-)]?[0-9]{4}|0[1-9][0-9]?[-(]?[0-9]{3}[-)]?[0-9]{4}|0[1-9][0-9]{2}[-(]?[0-9]{2}[-)]?[0-9]{4})$/;
    if (!電話正規表現.test(電話値.replace(/\s+/g, ''))) {
      エラー表示(入力電話番号, エラー電話番号, '正しい電話番号（例: 09012345678）を入力してください。');
      return false;
    }
    エラークリア(入力電話番号, エラー電話番号);
    return true;
  }

  function 検証同意チェック() {
    if (!入力同意チェック.checked) {
      エラー同意チェック.textContent = '個人情報の取り扱いに同意いただく必要があります。';
      エラー同意チェック.classList.add('有効');
      return false;
    }
    エラー同意チェック.textContent = '';
    エラー同意チェック.classList.remove('有効');
    return true;
  }

  // リアルタイム検証のイベント設定
  入力お名前.addEventListener('blur', 検証お名前);
  入力フリガナ.addEventListener('blur', 検証フリガナ);
  入力メールアドレス.addEventListener('blur', 検証メールアドレス);
  入力電話番号.addEventListener('blur', 検証電話番号);
  入力同意チェック.addEventListener('change', 検証同意チェック);

  // フォーム送信処理
  if (問い合わせフォーム) {
    問い合わせフォーム.addEventListener('submit', async (イベント) => {
      イベント.preventDefault();

      // 全フィールドを検証
      const お名前OK = 検証お名前();
      const フリガナOK = 検証フリガナ();
      const メールアドレスOK = 検証メールアドレス();
      const 電話番号OK = 検証電話番号();
      const 同意OK = 検証同意チェック();

      if (!(お名前OK && フリガナOK && メールアドレスOK && 電話番号OK && 同意OK)) {
        // エラーのある最初の要素にスクロール
        const 最初のエラー要素 = document.querySelector('.エラーあり, #同意チェック');
        if (最初のエラー要素) {
          最初のエラー要素.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // 送信中表示へ切り替え
      送信ボタン.disabled = true;
      送信ボタン.classList.add('送信中');

      // 送信データの準備
      const 送信データ = {
        お名前: 入力お名前.value.trim(),
        フリガナ: 入力フリガナ.value.trim(),
        メールアドレス: 入力メールアドレス.value.trim(),
        電話番号: 入力電話番号.value.trim(),
        希望プラン: 入力希望プラン.value,
        お問合せ内容: 入力お問合せ内容.value.trim()
      };

      try {
        // GAS URLが設定されていない（初期状態）場合の模擬送信処理
        if (スプレッドシート送信先URL === 'YOUR_GAS_WEBAPP_URL_HERE') {
          console.warn('Googleスプレッドシートへのデータ送信URL(スプレッドシート送信先URL)が設定されていません。模擬送信を実行します。');
          
          // 1.5秒のディレイで送信中アニメーションを表現
          await new Promise(解決 => setTimeout(解決, 1500));
        } else {
          // GASのWebアプリケーションへPOST送信
          // GASはリダイレクトを伴うため、mode: 'cors' または適切なフェッチ設定が必要
          const 応答 = await fetch(スプレッドシート送信先URL, {
            method: 'POST',
            mode: 'no-cors', // CORSエラー回避のための設定
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(送信データ)
          });
          
          // mode: 'no-cors' の場合はレスポンスの中身を読み取れないため、
          // fetchが例外を投げなければ送信成功とみなします。
        }

        // 送信完了画面への切り替え
        問い合わせフォーム.style.display = 'none';
        送信完了画面.style.display = 'block';
        送信完了画面.scrollIntoView({ behavior: 'smooth', block: 'center' });

      } catch (エラー) {
        console.error('送信エラー:', エラー);
        alert('送信中にエラーが発生しました。お手数ですが、時間をおいて再度お試しいただくか、お電話にてご連絡ください。');
      } finally {
        // ボタン状態のリセット
        送信ボタン.disabled = false;
        送信ボタン.classList.remove('送信中');
      }
    });
  }

  // 閉じるボタン（完了画面からフォームへ戻す）
  if (閉じるボタン) {
    閉じるボタン.addEventListener('click', () => {
      // フォームをリセットして再表示
      問い合わせフォーム.reset();
      問い合わせフォーム.style.display = 'block';
      送信完了画面.style.display = 'none';
      document.getElementById('コンセプト').scrollIntoView({ behavior: 'smooth' });
    });
  }
});
