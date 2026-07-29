document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splashScreen');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const journeyScreen = document.getElementById('journeyScreen');
    const giftInputScreen = document.getElementById('giftInputScreen');
    const giftBoxScreen = document.getElementById('giftBoxScreen');
    const cardSelectionScreen = document.getElementById('cardSelectionScreen');
    const endScreen = document.getElementById('endScreen');

    const badgeResultScreen = document.getElementById('badgeResultScreen');
    const giftResultScreen = document.getElementById('giftResultScreen');

    const toJourneyBtn = document.getElementById('toJourneyBtn');
    const toGiftBtn = document.getElementById('toGiftBtn');
    const submitNameBtn = document.getElementById('submitNameBtn');
    const interactiveGiftBox = document.getElementById('interactiveGiftBox');
    const claimText = document.getElementById('claimText');

    const lineProgress = document.getElementById('lineProgress');
    const timelineLine = document.getElementById('timelineLine');
    const timelineContainer = document.querySelector('.timeline-container');
    const nodes = document.querySelectorAll('.timeline-node');
    const fullEnglishName = document.getElementById('fullEnglishName');
    const errorMsg = document.getElementById('errorMsg');

    const cardsMainTitle = document.getElementById('cardsMainTitle');
    const selectionFinishBtn = document.getElementById('selectionFinishBtn');

    let userName = '';

    if (splashScreen) {
      splashScreen.addEventListener('animationend', (event) => {
        if (event.animationName === 'fadeOutSplash') {
          splashScreen.style.display = 'none';
          if (welcomeScreen) welcomeScreen.classList.add('active');
        }
      });
    }

    if (toJourneyBtn) {
      toJourneyBtn.addEventListener('click', () => {
        if (welcomeScreen) welcomeScreen.classList.remove('active');
        setTimeout(() => {
          if (journeyScreen) journeyScreen.classList.add('active');
          updateTimelineLinePosition();
          setTimeout(startTimelineJourney, 800);
        }, 300);
      });
    }

    if (toGiftBtn) {
      toGiftBtn.addEventListener('click', () => {
        if (journeyScreen) journeyScreen.classList.remove('active');
        setTimeout(() => {
          if (giftInputScreen) giftInputScreen.classList.add('active');
        }, 300);
      });
    }

    let timelineStarted = false;

    function isVerticalTimeline() {
      return window.matchMedia('(max-width: 900px)').matches;
    }

    // Positions the gold line so it passes exactly through the center of
    // every icon circle, regardless of how the node heights vary (e.g. when
    // Arabic titles wrap to two lines). Runs in both desktop (horizontal)
    // and mobile (vertical) modes.
    function updateTimelineLinePosition() {
      if (!timelineLine || !timelineContainer) return;
      const icons = document.querySelectorAll('.icon-circle');
      if (icons.length < 2) return;

      const containerRect = timelineContainer.getBoundingClientRect();
      const firstRect = icons[0].getBoundingClientRect();
      const lastRect = icons[icons.length - 1].getBoundingClientRect();

      if (isVerticalTimeline()) {
        // Vertical layout: line runs top-to-bottom, centered on icon column.
        const firstCenterY = firstRect.top + firstRect.height / 2 - containerRect.top;
        const lastCenterY = lastRect.top + lastRect.height / 2 - containerRect.top;
        const centerX = firstRect.left + firstRect.width / 2 - containerRect.left;

        timelineLine.style.top = `${firstCenterY}px`;
        timelineLine.style.bottom = 'auto';
        timelineLine.style.height = `${lastCenterY - firstCenterY}px`;
        timelineLine.style.left = `${centerX}px`;
        timelineLine.style.right = 'auto';
        timelineLine.style.width = '3px';
        timelineLine.style.transform = 'translateX(-50%)';
      } else {
        // Horizontal layout: line runs right-to-left (RTL), centered on icon row.
        const firstCenterX = firstRect.left + firstRect.width / 2 - containerRect.left;
        const lastCenterX = lastRect.left + lastRect.width / 2 - containerRect.left;
        const centerY = firstRect.top + firstRect.height / 2 - containerRect.top;
        const left = Math.min(firstCenterX, lastCenterX);
        const width = Math.abs(lastCenterX - firstCenterX);

        timelineLine.style.left = `${left}px`;
        timelineLine.style.right = 'auto';
        timelineLine.style.width = `${width}px`;
        timelineLine.style.top = `${centerY}px`;
        timelineLine.style.height = '4px';
        timelineLine.style.transform = 'none';
      }
    }

    // Recalculate whenever the layout could have changed size.
    if (timelineContainer && window.ResizeObserver) {
      const timelineResizeObserver = new ResizeObserver(() => {
        updateTimelineLinePosition();
      });
      timelineResizeObserver.observe(timelineContainer);
    }
    window.addEventListener('resize', updateTimelineLinePosition);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateTimelineLinePosition, 200);
    });
    window.addEventListener('load', updateTimelineLinePosition);

    function startTimelineJourney() {
      if (timelineStarted || nodes.length === 0) return;
      timelineStarted = true;
      updateTimelineLinePosition();

      const totalDuration = 5000; // مدة الحركة الإجمالية بالمللي ثانية (5 ثوانٍ)
      const startTime = performance.now();

      // إعادة ضبط حالات العقد في البداية
      nodes.forEach(node => {
        node.classList.remove('active', 'passed');
      });
      if (lineProgress) {
        lineProgress.style.setProperty('--progress', '0%');
      }

      function updateTimeline(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = elapsed / totalDuration;
        if (progress > 1) progress = 1;

        // تحديث عرض خط التقدم بشكل متزامن
        if (lineProgress) {
          lineProgress.style.setProperty('--progress', `${progress * 100}%`);
        }

        // حساب مواقع العقد نسبياً على طول الخط (بافتراض توزيع متساوی)
        nodes.forEach((node, index) => {
          const nodeTriggerProgress = index / (nodes.length - 1);

          if (progress >= nodeTriggerProgress) {
            // إذا وصل الخط إلى هذه العقدة أو تجاوزها
            if (index === nodes.length - 1) {
              // العقدة الأخيرة تصبح active عند الوصول إليها، وتظهر زر الهدية
              node.classList.add('active');
              node.classList.remove('passed');
              if (toGiftBtn) toGiftBtn.classList.add('show');
            } else {
              // العقد السابقة تصبح passed بمجرد تجاوزها
              node.classList.remove('active');
              node.classList.add('passed');
            }
          } else {
            // العقد التي لم يصلها الخط بعد
            node.classList.remove('active', 'passed');
          }
        });

        if (progress < 1) {
          requestAnimationFrame(updateTimeline);
        }
      }

      requestAnimationFrame(updateTimeline);
    }

    if (fullEnglishName) {
      fullEnglishName.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        if (errorMsg) errorMsg.classList.remove('visible');
      });
    }

    if (submitNameBtn) {
      submitNameBtn.addEventListener('click', () => {
        const value = fullEnglishName ? fullEnglishName.value.trim() : '';
        const nameRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/;
        const words = value.split(/\s+/).filter(w => w.length > 0);

        if (words.length >= 2 && nameRegex.test(value)) {
          userName = words.slice(0, 2).join(' ').toUpperCase();
          if (errorMsg) errorMsg.classList.remove('visible');

          if (giftInputScreen) giftInputScreen.classList.remove('active');
          setTimeout(() => {
            if (giftBoxScreen) giftBoxScreen.classList.add('active');
          }, 300);
        } else {
          if (errorMsg) {
            errorMsg.textContent = 'يرجى إدخال الاسم الأول والثاني باللغة الإنجليزية (أحرف فقط بدون أرقام أو رموز)';
            errorMsg.classList.add('visible');
          }
        }
      });
    }

    if (interactiveGiftBox) {
      interactiveGiftBox.addEventListener('click', () => {
        interactiveGiftBox.classList.add('open-anim');
        if (claimText) claimText.style.opacity = '0';

        setTimeout(() => {
          if (giftBoxScreen) giftBoxScreen.classList.remove('active');
          if (cardSelectionScreen) cardSelectionScreen.classList.add('active');
        }, 600);
      });
    }

    async function ensureFontsReady() {
      try {
        await Promise.all([
          document.fonts.load('bold 38px "GE SS Two"'),
          document.fonts.load('bold 54px "GE SS Two"'),
          document.fonts.ready
        ]);
      } catch (e) {}
    }

    function renderBadgeCanvas(nameText) {
      const canvas = document.getElementById('badgeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = 'Assets/Print_Templates/Badge_Template.png';

      img.onload = async () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await ensureFontsReady();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(canvas.width * 0.058)}px "GE SS Two", "Tajawal", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 8;

        const posX = canvas.width / 2;
        const posY = canvas.height * 0.535;

        ctx.fillText(nameText, posX, posY);
        ctx.shadowBlur = 0;
      };
    }

    window.downloadCanvas = function(canvasId, filename) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const imageURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Print fix: force the image onto a single sheet of paper, no page breaks / division.
    window.printCanvas = function(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');

      printWindow.document.write(`<!DOCTYPE html>
        <html>
        <head>
          <title>Print</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
            }
            img {
              display: block;
              max-width: 100vw;
              max-height: 100vh;
              width: auto;
              height: auto;
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" id="printImg">
          <script>
            const img = document.getElementById('printImg');
            if (img.complete) {
              window.print();
            } else {
              img.onload = () => window.print();
            }
            window.onafterprint = () => window.close();
          <\/script>
        </body>
        </html>`);
      printWindow.document.close();
    };

    window.downloadAsset = function(imageSrc) {
      fetch(imageSrc)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = imageSrc.split('/').pop();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
          console.error('Download failed:', err);
          const link = document.createElement('a');
          link.href = imageSrc;
          link.download = imageSrc.split('/').pop();
          link.target = '_blank';
          link.click();
        });
    };

    window.goToEndScreen = function(currentScreen) {
      if (currentScreen) {
        currentScreen.classList.remove('active');
      }
      setTimeout(() => {
        if (endScreen) {
          endScreen.classList.add('active');
        }
      }, 400);
    };

    // Resets the card selection state and shows the selection screen again,
    // so the user can pick a different gift after viewing a result.
    window.backToCardSelection = function(currentResultScreen) {
      if (currentResultScreen) {
        currentResultScreen.classList.remove('active');
      }

      cardItems.forEach(item => {
        item.classList.remove('selected-card', 'unselected-card');
      });

      if (cardsMainTitle) cardsMainTitle.style.opacity = '1';

      setTimeout(() => {
        if (cardSelectionScreen) cardSelectionScreen.classList.add('active');
        if (selectionFinishBtn) selectionFinishBtn.classList.add('show');
      }, 400);
    };

    if (selectionFinishBtn) {
      selectionFinishBtn.addEventListener('click', () => {
        goToEndScreen(cardSelectionScreen);
      });
    }

    window.openRedeemInstructions = function() {
      const existingModal = document.getElementById('customRedeemModal');
      if (existingModal) existingModal.remove();

      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'customRedeemModal';
      modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      modalOverlay.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 2px solid #a38258;
          border-radius: 16px;
          padding: 30px;
          width: 90%;
          max-width: 420px;
          text-align: right;
          direction: rtl;
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
          color: #ffffff;
          font-family: 'GE SS Two', 'Tajawal', sans-serif;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        ">
          <h3 style="margin-top: 0; color: #a38258; font-size: 22px; border-bottom: 1px solid rgba(163,130,88,0.3); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>خطوات الاستخدام</span>
            <span id="closeRedeemModal" style="cursor: pointer; font-size: 20px; color: #888; transition: color 0.2s;">&times;</span>
          </h3>
          <div style="margin: 20px 0; font-size: 16px; line-height: 1.8;">
            <p style="margin: 12px 0; display: flex; align-items: center; gap: 10px;">
              <span style="background: #a38258; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">1</span>
              <span>قم بتحميل الصورة</span>
            </p>
            <p style="margin: 12px 0; display: flex; align-items: center; gap: 10px;">
              <span style="background: #a38258; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">2</span>
              <span>تواصل مع مجد عن طريق واتساب</span>
            </p>
          </div>
          <button id="modalOkBtn" style="
            width: 100%;
            background: #a38258;
            color: #ffffff;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
            font-family: inherit;
          ">فهمت ذلك</button>
        </div>
      `;

      document.body.appendChild(modalOverlay);

      setTimeout(() => {
        modalOverlay.style.opacity = '1';
        modalOverlay.querySelector('div').style.transform = 'scale(1)';
      }, 10);

      const closeModal = () => {
        modalOverlay.style.opacity = '0';
        modalOverlay.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => modalOverlay.remove(), 300);
      };

      document.getElementById('closeRedeemModal').addEventListener('click', closeModal);
      document.getElementById('modalOkBtn').addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    };

    const couponImages = [
      'Assets/Print_Templates/Gift Card 5_.png',
      'Assets/Print_Templates/Gift Card 10_.png',
      'Assets/Print_Templates/Gift Card.png'
    ];

    const cardItems = document.querySelectorAll('.gift-card-item');
    cardItems.forEach(card => {
      card.addEventListener('click', () => {
        const selectedType = card.getAttribute('data-card-type');

        cardItems.forEach(item => {
          if (item === card) {
            item.classList.add('selected-card');
          } else {
            item.classList.add('unselected-card');
          }
        });

        if (cardsMainTitle) cardsMainTitle.style.opacity = '0';
        if (selectionFinishBtn) selectionFinishBtn.classList.remove('show');

        if (selectedType === 'badge') {
          renderBadgeCanvas(userName);
        } else if (selectedType === 'gift') {
          const randomIndex = Math.floor(Math.random() * couponImages.length);
          const assignedCoupon = couponImages[randomIndex];

          const randomGiftImg = document.getElementById('randomGiftImg');
          const downloadGiftBtn = document.getElementById('downloadGiftBtn');

          if (randomGiftImg) {
            randomGiftImg.src = assignedCoupon;
          }

          if (downloadGiftBtn) {
            downloadGiftBtn.onclick = function() {
              downloadAsset(assignedCoupon);
            };
          }
        }

        setTimeout(() => {
          if (cardSelectionScreen) cardSelectionScreen.classList.remove('active');

          setTimeout(() => {
            if (selectedType === 'badge' && badgeResultScreen) {
              badgeResultScreen.classList.add('active');
            } else if (selectedType === 'gift' && giftResultScreen) {
              giftResultScreen.classList.add('active');
            }
          }, 400);
        }, 900);
      });
    });
});
